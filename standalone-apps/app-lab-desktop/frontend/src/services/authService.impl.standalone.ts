import { AuthService } from '@cloud-editor-mono/domain/src/services/services-by-app/shared';

import {
  DeleteRefreshToken,
  GetRefreshToken,
  SetRefreshToken,
} from '../../wailsjs/go/app/App';

export const getAuthRefreshToken: AuthService['getAuthRefreshToken'] = async (
  user,
) => {
  return GetRefreshToken(user);
};

export const setAuthRefreshToken: AuthService['setAuthRefreshToken'] = async (
  user,
  token,
) => {
  return SetRefreshToken(user, token);
};

export const deleteAuthRefreshToken: AuthService['deleteAuthRefreshToken'] =
  async (user) => {
    return DeleteRefreshToken(user);
  };
