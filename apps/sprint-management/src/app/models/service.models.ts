import { InjectionToken, Signal } from '@angular/core';
import { AppConfig } from './models';

export interface SprintManagementApiServiceConfig {
  appConfig: Signal<Partial<AppConfig>>;
  initialized: Signal<boolean>;
}

export const SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN = new InjectionToken<SprintManagementApiServiceConfig>(
  'Sprint Management API Service Config',
);
