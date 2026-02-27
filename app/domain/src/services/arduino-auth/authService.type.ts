export interface AuthService {
  getAuthRefreshToken: (user: string) => Promise<string>;
  setAuthRefreshToken: (user: string, token: string) => Promise<void>;
  deleteAuthRefreshToken: (user: string) => Promise<void>;
}
