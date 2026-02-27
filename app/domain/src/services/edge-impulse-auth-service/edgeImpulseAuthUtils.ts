import { Config } from '@cloud-editor-mono/common';

import { BackendAuthCache } from '../arduino-auth/arduinoAuthDesktopUtils';
import { EdgeImpulseClientOptions } from './edgeImpulseAuthClient';

export const EI_STORAGE_KEYS = {
  TOKENS: `@@ei_tokens@@::${Config.EI_CLIENT_ID}::${Config.EI_STUDIO_HOST}::${Config.EI_SCOPE}`,
  VERIFIER: 'ei_verifier',
  STATE: 'ei_auth_state',
};

export const EI_KEYRING_USER = 'ei_refresh_token';

export const isRefreshTokenKey = (key: string): boolean => {
  return key.endsWith(`::${Config.EI_STUDIO_HOST}::${Config.EI_SCOPE}`);
};

export const defaultDesktopEdgeImpulseOptions: EdgeImpulseClientOptions = {
  domain: Config.EI_STUDIO_HOST,
  clientId: Config.EI_CLIENT_ID,
  cache: new BackendAuthCache(EI_KEYRING_USER, isRefreshTokenKey),
};
