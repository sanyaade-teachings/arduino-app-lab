import { AuthService } from './authService.type';

export let getAuthRefreshToken: (user: string) => Promise<string> =
  async function () {
    throw new Error('getAuthRefreshToken method not implemented');
  };

export let setAuthRefreshToken: (user: string, token: string) => Promise<void> =
  async function () {
    throw new Error('setAuthRefreshToken method not implemented');
  };

export let deleteAuthRefreshToken: (user: string) => Promise<void> =
  async function () {
    throw new Error('deleteAuthRefreshToken method not implemented');
  };

export const setArduinoAuthService = (service: AuthService): void => {
  getAuthRefreshToken = service.getAuthRefreshToken;
  setAuthRefreshToken = service.setAuthRefreshToken;
  deleteAuthRefreshToken = service.deleteAuthRefreshToken;
};
