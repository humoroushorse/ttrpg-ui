import { InjectionToken } from '@angular/core';

export interface EventPlanningApiServiceConfig {
  APP_TTRPG_EVENT_PLANNING__API_BASE_PATH: string;
}

export const EVENT_PLANNING_API_SERVICE_CONFIG_TOKEN = new InjectionToken<EventPlanningApiServiceConfig>(
  'Event Planning API Service Config',
);
