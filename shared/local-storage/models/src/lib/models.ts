import { InjectionToken } from '@angular/core';

export interface SharedLocalStorageServiceConfig {
  namespace: string;
}

export const SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN = new InjectionToken<SharedLocalStorageServiceConfig>(
  'Shared Local Storage Service Config',
);
