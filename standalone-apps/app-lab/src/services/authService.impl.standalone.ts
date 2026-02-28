import { AuthService } from '@cloud-editor-mono/domain/src/services/services-by-app/shared';

export const getAuthRefreshToken: AuthService['getAuthRefreshToken'] =
  async function () {
    return '';
  };

export const setAuthRefreshToken: AuthService['setAuthRefreshToken'] =
  async function () {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  };

export const deleteAuthRefreshToken: AuthService['deleteAuthRefreshToken'] =
  async function () {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  };
