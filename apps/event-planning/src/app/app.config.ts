import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideExperimentalZonelessChangeDetection,
  // provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppTheme, SHARED_THEME_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/theme/models';
import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';
import { SHARED_CORE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/core/models';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { AUTH_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/features/auth/models';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { AppConfigService } from './service/app-config.service';
import { LocationStrategy } from '@angular/common';

const themes: AppTheme[] = [
  { viewValue: 'light', path: 'default-theme-light.css', isDark: false },
  { viewValue: 'dark', path: 'default-theme-dark.css', isDark: true },
];

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (appConfigService: AppConfigService, httpClient: HttpClient, locationStrategy: LocationStrategy) =>
        appConfigService.initializerFactory(httpClient, locationStrategy),
      deps: [AppConfigService, HttpClient, LocationStrategy],
      multi: true,
    },
    provideExperimentalZonelessChangeDetection(),
    // provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideAnimationsAsync(),
    provideHttpClient(),
    {
      provide: AUTH_SERVICE_CONFIG_TOKEN,
      useFactory: (appConfigService: AppConfigService) => ({
        initialized: appConfigService.initialized.asReadonly(),
        appConfig: appConfigService.appConfig.asReadonly(),
      }),
      deps: [AppConfigService],
      // useValue: { baseUrl: '/ttrpg-event-planning-api' },
    },
    {
      provide: SHARED_THEME_SERVICE_CONFIG_TOKEN,
      useValue: { themes },
    },
    {
      provide: SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN,
      useValue: { namespace: 'ttrpg-event-planning' },
    },
    {
      provide: SHARED_CORE_SERVICE_CONFIG_TOKEN,
      useValue: { appTitle: 'TTRPG: Event Planning' },
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
  ],
};
