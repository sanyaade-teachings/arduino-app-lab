import { Config } from '@cloud-editor-mono/common';

import {
  deleteAuthRefreshToken,
  getAuthRefreshToken,
  setAuthRefreshToken,
} from '../arduino-auth';
import { getBrowser } from '../utils';
import {
  AUTH_KEYRING_USER,
  defaultAuth0Options,
  DefaultAuthOptions,
} from './arduinoAuthUtils';

const inMemoryCache = new Map();

const isRefreshTokenKey = (key: string): boolean => {
  return key.endsWith(`::${Config.AUTH_AUDIENCE}::${Config.AUTH_SCOPE}`);
};

export class BackendAuthCache {
  private backendKey: string;
  private checkRefreshTokenKey: (key: string) => boolean;

  constructor(
    backendKey: string,
    checkRefreshTokenKey: (key: string) => boolean,
  ) {
    this.backendKey = backendKey;
    this.checkRefreshTokenKey = checkRefreshTokenKey;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  // @ts-ignore
  async set(key, entry) {
    if (this.checkRefreshTokenKey(key)) {
      try {
        const stringified = JSON.stringify(entry);
        await setAuthRefreshToken(this.backendKey, stringified);
      } catch (error) {
        console.error('Error setting refresh token:', error);
      }
    }

    inMemoryCache.set(key, entry);
  }
  async get(key: string) {
    if (this.checkRefreshTokenKey(key)) {
      try {
        const tokenString = await getAuthRefreshToken(this.backendKey);
        if (tokenString) {
          const parsed = JSON.parse(tokenString);
          return parsed;
        }
      } catch (error) {
        console.error('Error getting refresh token:', error);
      }
    }

    const entry = inMemoryCache.get(key);
    if (entry) {
      return entry;
    }

    return undefined;
  }
  async remove(key: string): Promise<void> {
    if (this.checkRefreshTokenKey(key)) {
      try {
        await deleteAuthRefreshToken(this.backendKey);
      } catch (error) {
        console.error('Error deleting refresh token:', error);
      }
    }

    inMemoryCache.delete(key);
  }
}

const getAppLabOrigin = (browser: string | undefined): string => {
  if (browser?.includes('Edge')) {
    return Config.APP_ORIGIN_WINDOWS;
  }
  if (browser?.includes('WebKit')) {
    return Config.APP_ORIGIN_MAC;
  }
  return Config.APP_ORIGIN;
};

const generateAuthUris = (): { redirect_uri: string; logout_uri: string } => {
  const browser = getBrowser();

  const origin = getAppLabOrigin(browser);
  const redirect_uri = Config.REDIRECT_URI;
  const logout_uri = `${origin}/redirect`;

  return {
    redirect_uri,
    logout_uri,
  };
};

const { redirect_uri, logout_uri } = generateAuthUris();

export const defaultDesktopAuth0Options: DefaultAuthOptions = {
  ...defaultAuth0Options,
  authorizationParams: {
    ...defaultAuth0Options.authorizationParams,
    redirect_uri,
    logout_uri,
    source: 'app-lab',
  },
  cache: new BackendAuthCache(AUTH_KEYRING_USER, isRefreshTokenKey),
  useRefreshTokens: true,
};
