import { InjectionToken, Signal } from '@angular/core';

export interface ServiceConfig {
  APP_TTRPG_EVENT_PLANNING__API_BASE_PATH: string;
}

export interface AuthServiceConfig {
  initialized: Signal<boolean>;
  appConfig: Signal<ServiceConfig>;
}

export const AUTH_SERVICE_CONFIG_TOKEN = new InjectionToken<AuthServiceConfig>(
  'Auth Service Config',
);

export interface AuthResponse {
  // access_token: string
  expires_in: number
  refresh_expires_in: number
  // refresh_token: string
  token_type: string
  id_token: string
  "not-before-policy": number
  session_state: string
  scope: string
}
