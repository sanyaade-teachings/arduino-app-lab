import {
  ArduinoUser,
  AuthClient,
  GetTokenSilentlyOptions,
} from '@bcmi-labs/art-auth';
import { Config, setGlobalConfig } from '@cloud-editor-mono/common';
import {
  AUTH_KEYRING_USER,
  eventsOn,
} from '@cloud-editor-mono/domain/src/services/services-by-app/app-lab';
import {
  AppState,
  Auth0GetTokenError,
  auth0IsAuthenticated,
  createAuth0Instance,
  createAuth0InstanceSync,
  getAuth0AppState,
  getAuth0TokenSilently,
  getAuth0User,
  loginAuth0WithRedirect,
  USER_CLAIM_CONNECTION,
  USER_CLAIM_ROLES,
} from '@cloud-editor-mono/infrastructure';
import { set } from 'idb-keyval';

import {
  deleteAuthRefreshToken,
  openLinkExternal,
} from '../services-by-app/app-lab';
import { defaultDesktopAuth0Options } from './arduinoAuthDesktopUtils';
import {
  AUTH_COOKIE_SUBSTRING,
  AUTH_REDIRECT_TO_STORAGE_KEY,
  defaultAuth0Options,
  DefaultAuthOptions,
  EXPIRED_COOKIE,
  NO_AUTH_TOKEN_PLACEHOLDER,
  NOT_ADULT_TYPES,
  SILENT_AUTHENTICATION_TIMEOUT,
} from './arduinoAuthUtils';

function getOptions(): DefaultAuthOptions {
  return Config.APP_NAME === 'App Lab'
    ? defaultDesktopAuth0Options
    : defaultAuth0Options;
}

export let authServiceClient: AuthClient | null = null;
export let injectedUser: ArduinoUser | null = null;
let cancelPendingLogin: (() => void) | null = null;

export async function getAuthClient(): Promise<AuthClient> {
  if (!authServiceClient) {
    authServiceClient = await initialize();
  }
  return authServiceClient;
}

export function getAuthClientSync(): AuthClient {
  if (!authServiceClient) {
    authServiceClient = initializeSync();
  }

  return authServiceClient;
}

async function initialize(): Promise<AuthClient> {
  const options = getOptions();
  const instance = await createAuth0Instance(
    options,
    SILENT_AUTHENTICATION_TIMEOUT,
  );

  const customUrl = instance.getCustomization()?.url;
  if (customUrl) {
    setGlobalConfig({
      CLOUD_HOME_URL: customUrl,
      APP_ORIGIN: customUrl,
      NEW_WINDOW_ORIGIN: customUrl,
      SERIAL_MONITOR_PARENT_ORIGIN: customUrl,
    });
  }

  authServiceClient = instance;

  return instance;
}

function initializeSync(optionsOverride?: DefaultAuthOptions): AuthClient {
  const options = optionsOverride || getOptions();
  const instance = createAuth0InstanceSync(options);

  authServiceClient = instance;

  return instance;
}

export async function login(): Promise<void> {
  if (!authServiceClient) {
    throw new Error('Cannot login when auth client not initialized');
  }
  const { state: previousState, ...restOptions } =
    defaultAuth0Options.authorizationParams;

  await set(AUTH_REDIRECT_TO_STORAGE_KEY, {
    previousState,
    redirectTo: window.location.pathname + window.location.search,
  });

  loginAuth0WithRedirect(authServiceClient, {
    ...restOptions,
    appState: { previousState },
  });
}

export async function loginWithBrowser(
  storeRedirect = true,
  redirectUri?: string,
): Promise<void> {
  if (!authServiceClient) {
    authServiceClient = await initialize();
  }
  const client = authServiceClient;

  if (cancelPendingLogin) {
    cancelPendingLogin();
    cancelPendingLogin = null;
  }

  return new Promise((resolve, reject) => {
    const cancelListener = eventsOn('auth-deep-link', async (url: string) => {
      try {
        await client.handleRedirectCallback(url);
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        if (cancelPendingLogin) {
          cancelPendingLogin();
          cancelPendingLogin = null;
        }
      }
    });

    cancelPendingLogin = cancelListener;

    const executeLogin = async (): Promise<void> => {
      try {
        const options = getOptions();

        if (redirectUri) {
          options.authorizationParams.redirect_uri = redirectUri;
        }

        const { state: previousState, ...restOptions } =
          options.authorizationParams;

        if (storeRedirect) {
          await set(AUTH_REDIRECT_TO_STORAGE_KEY, {
            previousState,
            redirectTo: window.location.pathname + window.location.search,
          });
        }

        await loginAuth0WithRedirect(client, {
          ...restOptions,
          async openUrl(url) {
            openLinkExternal(url);
          },
          appState: { previousState },
        });
      } catch (error) {
        if (cancelPendingLogin) {
          cancelPendingLogin();
          cancelPendingLogin = null;
        }
        reject(error);
      }
    };

    executeLogin();
  });
}

export async function getAuthState(): Promise<AppState | null> {
  if (!authServiceClient) {
    throw new Error('Cannot get auth state when Auth client not initialized');
  }

  return getAuth0AppState(authServiceClient);
}

export async function logout(): Promise<void> {
  removeAuthenticatedCookie();

  try {
    await deleteAuthRefreshToken(AUTH_KEYRING_USER);
  } catch (e) {
    console.error('Error deleting refresh token', e);
  }

  injectedUser = null;
  authServiceClient = null;
}

export async function isAuthenticated(): Promise<boolean> {
  if (!authServiceClient) {
    throw new Error('Can not authenticate when Auth client not initialized');
  }

  return auth0IsAuthenticated(authServiceClient);
}

export function hasAuthenticatedCookie(): boolean {
  const value = `; ${document.cookie}`;
  const parts = value.split(AUTH_COOKIE_SUBSTRING);
  return parts.length === 2;
}

export function removeAuthenticatedCookie(): void {
  document.cookie = EXPIRED_COOKIE;
}

export async function isAdult(profile: ArduinoUser): Promise<boolean> {
  const type = String(profile[USER_CLAIM_CONNECTION]);
  const isNotAdult = NOT_ADULT_TYPES.includes(type);

  return !isNotAdult;
}

const BETA_TEST_ROLE = 'ce-beta-tester';
export function isBetaTestUser(profile: ArduinoUser): boolean {
  const roles = profile[USER_CLAIM_ROLES];
  const rolesMapped = Array.isArray(roles) ? roles.map((r) => String(r)) : [];

  return rolesMapped.includes(BETA_TEST_ROLE);
}

export async function retrieveAuth0User(): Promise<ArduinoUser | null> {
  if (!authServiceClient) {
    throw new Error('Cannot get user when Auth client not initialized');
  }

  return getAuth0User(authServiceClient);
}

export async function getAuthAccessToken(
  options?: GetTokenSilentlyOptions,
  doNotForceLogin = false,
): Promise<string> {
  if (!authServiceClient) {
    throw new Error('Cannot get token when Auth client not initialized');
  }

  try {
    return await getAuth0TokenSilently(authServiceClient, options);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (doNotForceLogin) {
      return NO_AUTH_TOKEN_PLACEHOLDER;
    }
    switch (e.error) {
      case Auth0GetTokenError.LoginRequired:
        removeAuthenticatedCookie();
        login();
        break;
      case Auth0GetTokenError.InteractionRequired:
        login();
        break;
    }

    throw e;
  }
}

export function setInjectedUser(user: ArduinoUser | null): void {
  injectedUser = user;
}
