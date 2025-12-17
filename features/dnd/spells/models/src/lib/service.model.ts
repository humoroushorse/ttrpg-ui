import { InjectionToken, Signal } from '@angular/core';

export interface DndSpellApiServiceConfig {
  appConfig: Signal<{
    APP_TTRPG_DND_SPELL__API_BASE_PATH: string;
  }>;
}

export const DND_SPELL_API_SERVICE_CONFIG_TOKEN = new InjectionToken<DndSpellApiServiceConfig>(
  'DND Spell API Service Config',
);
