import { InjectionToken, Signal } from '@angular/core';

export interface DndSpellApiServiceConfig {
  appConfig: Signal<{
    APP_TTRPG_DND__API_BASE_PATH: string;
  }>;
  initialized: boolean;
}

export const DND_SPELL_API_SERVICE_CONFIG_TOKEN = new InjectionToken<DndSpellApiServiceConfig>(
  'DND Spell API Service Config',
);
