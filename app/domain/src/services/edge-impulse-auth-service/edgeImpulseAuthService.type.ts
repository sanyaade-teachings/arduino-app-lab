export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
  studioHost?: string;
  defaultIdps?: string[];
}

export interface OAuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export interface OAuthUser {
  id: number;
  email: string;
  permissions: string[];
}

export interface OAuthRequest {
  oauthToken?: OAuthToken;
  oauthUser?: OAuthUser;
}

export interface EdgeImpulseUser {
  id: number;
  username: string;
  name: string;
  email: string;
  photo?: string;
  success?: boolean;
}
