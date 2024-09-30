import { InjectionToken } from '@angular/core';

export interface AppTheme {
  path: string;
  viewValue: string;
  isDark: boolean;
}

export interface SharedThemeServiceConfig {
  themes: AppTheme[];
}

export const SHARED_THEME_SERVICE_CONFIG_TOKEN = new InjectionToken<SharedThemeServiceConfig>(
  'Shared Theme Service Config',
);
