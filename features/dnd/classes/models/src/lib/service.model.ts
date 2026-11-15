import { InjectionToken, Signal } from '@angular/core';

/** What the API service needs: the app config (loaded at startup, so a signal) holding the base path */
export interface DndClassApiServiceConfig {
  appConfig: Signal<{
    APP_TTRPG_DND__API_BASE_PATH: string;
  }>;
  initialized: boolean;
}

/** Provided by the app (app.config.ts), from AppConfigService */
export const DND_CLASS_API_SERVICE_CONFIG_TOKEN = new InjectionToken<DndClassApiServiceConfig>(
  'Dnd Class API Service Config',
);
