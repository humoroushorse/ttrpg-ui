import { InjectionToken } from '@angular/core';

export interface SharedCoreServiceConfig {
  appTitle: string;
}

export const SHARED_CORE_SERVICE_CONFIG_TOKEN = new InjectionToken<SharedCoreServiceConfig>(
  'Shared Core Service Config',
);
