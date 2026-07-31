import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZonelessChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideClientHydration, withEventReplay, withNoIncrementalHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpClient, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { LocationStrategy } from '@angular/common';
import { provideServiceWorker } from '@angular/service-worker';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { AppConfigService } from './service/app-config.service';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN = SprintModels.Service.SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN;
import { AUTH_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/features/auth/models';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';
import { SHARED_CORE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/core/models';
import { AppTheme, SHARED_THEME_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/theme/models';
import { AuthInterceptors } from '@ttrpg-ui/features/auth/util';

const themes: AppTheme[] = [
  { viewValue: 'dark', path: 'default-theme-dark.css', isDark: true },
  { viewValue: 'light', path: 'default-theme-light.css', isDark: false },
  { viewValue: 'teal-dark', path: 'teal-theme-dark.css', isDark: true },
  { viewValue: 'teal-light', path: 'teal-theme-light.css', isDark: false },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      const appConfigService = inject(AppConfigService);
      const httpClient = inject(HttpClient);
      const locationStrategy = inject(LocationStrategy);
      return appConfigService.initializerFactory(httpClient, locationStrategy);
    }),
    provideAppInitializer(() => {
      const _authService = inject(AuthService);
    }),
    provideClientHydration(withEventReplay(), withNoIncrementalHydration()),
    provideAnimationsAsync(),
    provideZonelessChangeDetection(),
    provideRouter(appRoutes),
    provideHttpClient(withFetch(), withInterceptors([AuthInterceptors.authInterceptor])),
    {
      provide: SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN,
      useFactory: (appConfigService: AppConfigService) => ({
        appConfig: appConfigService.appConfig,
        initialized: appConfigService.initialized,
      }),
      deps: [AppConfigService],
    },
    {
      provide: AUTH_SERVICE_CONFIG_TOKEN,
      useFactory: (appConfigService: AppConfigService) => ({
        appConfig: appConfigService.appConfig,
        initialized: appConfigService.initialized,
        authGuardAuthAppRouteBase: ['/auth'],
        alreadyLoggedInGuardRedirectRoute: ['/board'],
      }),
      deps: [AppConfigService],
    },
    {
      provide: SHARED_THEME_SERVICE_CONFIG_TOKEN,
      useValue: { themes },
    },
    {
      provide: SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN,
      useValue: { namespace: 'sprint-management' },
    },
    {
      provide: SHARED_CORE_SERVICE_CONFIG_TOKEN,
      useValue: { appTitle: 'Sprint Management' },
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'fill' },
    },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
