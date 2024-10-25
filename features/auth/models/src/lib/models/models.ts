import { InjectionToken } from '@angular/core';

export interface ServiceConfig {
  APP_TTRPG_EVENT_PLANNING__API_BASE_PATH: string;
}

export interface AuthServiceConfig {
  APP_TTRPG_EVENT_PLANNING__API_BASE_PATH: string;
  authGuardRedirectRoute: string[];
  alreadyLoggedInGuardRedirectRoute: string[];
}

export const AUTH_SERVICE_CONFIG_TOKEN = new InjectionToken<AuthServiceConfig>('Auth Service Config');

export interface AuthResponse {
  // access_token: string
  expires_in: number;
  refresh_expires_in: number;
  // refresh_token: string
  token_type: string;
  id_token: string;
  'not-before-policy': number;
  session_state: string;
  scope: string;
}

export interface RegisterUserInput {
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface UserIdToken {
  exp: number;
  iat: number;
  jti: string;
  iss: string;
  aud: string;
  sub: string;
  typ: string;
  azp: string;
  sid: string;
  at_hash: string;
  acr: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
}
