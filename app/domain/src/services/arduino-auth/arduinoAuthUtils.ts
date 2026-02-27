import { Auth0ClientOptions, AuthorizationParams } from '@bcmi-labs/art-auth';
import { Config } from '@cloud-editor-mono/common';
import { deploymentPath } from '@cloud-editor-mono/infrastructure';

function uriWithKey(uri: string): string {
  if (deploymentPath.customKey) {
    return uri.replace('https://', `https://${deploymentPath.customKey}.`);
  }
  return uri;
}

const generateAuthUris = (): { redirect_uri: string; logout_uri: string } => {
  const { APP_URL, CLOUD_HOME_URL } = Config;

  return {
    redirect_uri: uriWithKey(`${APP_URL}/redirect`),
    logout_uri: uriWithKey(`${CLOUD_HOME_URL}/sketches`),
  };
};

const { redirect_uri, logout_uri } = generateAuthUris();

export type DefaultAuthOptions = Auth0ClientOptions & {
  authorizationParams: AuthorizationParams & {
    state: string;
  };
};

export const defaultAuth0Options: DefaultAuthOptions = {
  domain: Config.AUTH_URL,
  clientId: Config.AUTH_ID,
  authorizationParams: {
    redirect_uri,
    logout_uri,
    audience: Config.AUTH_AUDIENCE,
    scope: Config.AUTH_SCOPE,
    state: generateDefaultStateOption(),
  },
  cacheLocation: 'memory',
};

export const SILENT_AUTHENTICATION_TIMEOUT = 5;

export function generateDefaultStateOption(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function noTokenReject(): Promise<never> {
  return Promise.reject(new Error('User not authorized to perform request'));
}

export const NOT_ADULT_TYPES = ['coppa', 'edu'];

export const AUTH_COOKIE_SUBSTRING = `; auth0.${defaultAuth0Options.authorizationParams.client_id}.is.authenticated=`;
export const EXPIRED_COOKIE = `auth0.${defaultAuth0Options.authorizationParams.client_id}.is.authenticated=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;

export const AUTH_REDIRECT_TO_STORAGE_KEY = 'authRedirectTo';
export const AUTH_ACTION_ATTEMPTED = 'auth-action-attempted';

export const NO_AUTH_TOKEN_PLACEHOLDER = 'token-placeholder';

export const AUTH_KEYRING_USER = 'auth_refresh_token';
