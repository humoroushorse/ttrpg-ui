import { InjectionToken, Signal } from '@angular/core';

export interface AppConfig {
  APP_SPRINT_MANAGEMENT__API_BASE_PATH: string;
  APP_SPRINT_MANAGEMENT__API_URL: string;
}

export interface SprintManagementApiServiceConfig {
  appConfig: Signal<AppConfig>;
  initialized: Signal<boolean>;
}

export const SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN = new InjectionToken<SprintManagementApiServiceConfig>(
  'Sprint Management API Service Config',
);
