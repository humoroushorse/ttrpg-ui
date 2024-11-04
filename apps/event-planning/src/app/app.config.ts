import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
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
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppConfigService } from './service/app-config.service';
import { LocationStrategy } from '@angular/common';
import { CoreErrorHandler } from '@ttrpg-ui/shared/core/util';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { NativeDateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, DateAdapter } from '@angular/material/core';
import { AuthInterceptors } from '@ttrpg-ui/features/auth/util';

const themes: AppTheme[] = [
  { viewValue: 'dark', path: 'default-theme-dark.css', isDark: true },
  { viewValue: 'light', path: 'default-theme-light.css', isDark: false },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideAppInitializer(() => {
      const appConfigService = inject(AppConfigService);
      const httpClient = inject(HttpClient);
      const locationStrategy = inject(LocationStrategy);
      appConfigService.initializerFactory(httpClient, locationStrategy);
    }),
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: (appConfigService: AppConfigService, httpClient: HttpClient, locationStrategy: LocationStrategy) =>
    //     appConfigService.initializerFactory(httpClient, locationStrategy),
    //   deps: [AppConfigService, HttpClient, LocationStrategy],
    //   multi: true,
    // },
    provideExperimentalZonelessChangeDetection(),
    // provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideAnimationsAsync(),

    provideHttpClient(),

    provideHttpClient(
      withInterceptors([AuthInterceptors.authInterceptor]),
      // withFetch()
    ),
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: AuthInterceptors.AuthInterceptor,
    //   multi: true
    // },
    {
      provide: EventPlanningModels.Service.EVENT_PLANNING_API_SERVICE_CONFIG_TOKEN,
      useFactory: (appConfigService: AppConfigService) =>
        ({
          appConfig: appConfigService.appConfig,
          initialized: appConfigService.initialized,
        }) as EventPlanningModels.Service.EventPlanningApiServiceConfig,
      deps: [AppConfigService],
      // useValue: { baseUrl: '/ttrpg-event-planning-api' },
    },
    {
      provide: AUTH_SERVICE_CONFIG_TOKEN,
      useFactory: (appConfigService: AppConfigService) => ({
        appConfig: appConfigService.appConfig,
        initialized: appConfigService.initialized,
        authGuardAuthAppRouteBase: ['/', 'auth'],
        alreadyLoggedInGuardRedirectRoute: ['/', 'event-planning'],
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
      useValue: { appTitle: 'TTRPG' },
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
    {
      provide: ErrorHandler,
      useClass: CoreErrorHandler,
    },
  ],
};
