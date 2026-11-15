import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideZonelessChangeDetection,
  // provideZoneChangeDetection
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterResources } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AppTheme, SHARED_THEME_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/theme/models';
import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';
import { SHARED_CORE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/core/models';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { AUTH_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/features/auth/models';
import { HttpClient, provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { AppConfigService } from './service/app-config.service';
import { LocationStrategy } from '@angular/common';
import { CoreErrorHandler } from '@ttrpg-ui/shared/core/util';
import { NativeDateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS, DateAdapter } from '@angular/material/core';
import { AuthInterceptors } from '@ttrpg-ui/features/auth/util';
import { DndSpellModels } from '@ttrpg-ui/features/dnd/spells/models';
import { DndClassModels } from '@ttrpg-ui/features/dnd/classes/models';
import { DndSubclassModels } from '@ttrpg-ui/features/dnd/subclasses/models';
import { DndSpeciesModels } from '@ttrpg-ui/features/dnd/species/models';
import { DndBackgroundModels } from '@ttrpg-ui/features/dnd/backgrounds/models';
import { DndFeatModels } from '@ttrpg-ui/features/dnd/feats/models';
import { DndItemModels } from '@ttrpg-ui/features/dnd/items/models';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { DndCampaignModels } from '@ttrpg-ui/features/dnd/campaigns/models';

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
      // returned so bootstrap waits for app.config.json
      return appConfigService.initializerFactory(httpClient, locationStrategy);
    }),
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: (appConfigService: AppConfigService, httpClient: HttpClient, locationStrategy: LocationStrategy) =>
    //     appConfigService.initializerFactory(httpClient, locationStrategy),
    //   deps: [AppConfigService, HttpClient, LocationStrategy],
    //   multi: true,
    // },
    provideZonelessChangeDetection(),
    // provideZoneChangeDetection({ eventCoalescing: true }),
    // route `resources` arrive as component inputs
    provideRouter(appRoutes, withComponentInputBinding(), withRouterResources()),
    provideAnimationsAsync(),

    provideHttpClient(
      withXhr(),
      withInterceptors([AuthInterceptors.authInterceptor]),
      // withFetch()
    ),
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: AuthInterceptors.AuthInterceptor,
    //   multi: true
    // },
    {
      provide: DndSpellModels.Service.DND_SPELL_API_SERVICE_CONFIG_TOKEN,
      useFactory: (appConfigService: AppConfigService) => ({
        appConfig: appConfigService.appConfig,
        initialized: appConfigService.initialized,
      }),
      // }) as DndSpellModels.Service.DndSpellApiServiceConfig,
      deps: [AppConfigService],
      // useValue: { baseUrl: '/ttrpg-dnd-api' },
    },
    {
      provide: DndClassModels.Service.DND_CLASS_API_SERVICE_CONFIG_TOKEN,
      useFactory: (appConfigService: AppConfigService) => ({
        appConfig: appConfigService.appConfig,
        initialized: appConfigService.initialized,
      }),
      deps: [AppConfigService],
    },
    {
      provide: DndSubclassModels.Service.DND_SUBCLASS_API_SERVICE_CONFIG_TOKEN,
      useFactory: (appConfigService: AppConfigService) => ({
        appConfig: appConfigService.appConfig,
        initialized: appConfigService.initialized,
      }),
      deps: [AppConfigService],
    },
    {
      provide: DndSpeciesModels.Service.DND_SPECIES_API_SERVICE_CONFIG_TOKEN,
      useFactory: (appConfigService: AppConfigService) => ({
        appConfig: appConfigService.appConfig,
        initialized: appConfigService.initialized,
      }),
      deps: [AppConfigService],
    },
    {
      provide: DndBackgroundModels.Service.DND_BACKGROUND_API_SERVICE_CONFIG_TOKEN,
      useFactory: (appConfigService: AppConfigService) => ({
        appConfig: appConfigService.appConfig,
        initialized: appConfigService.initialized,
      }),
      deps: [AppConfigService],
    },
    {
      provide: DndFeatModels.Service.DND_FEAT_API_SERVICE_CONFIG_TOKEN,
      useFactory: (appConfigService: AppConfigService) => ({
        appConfig: appConfigService.appConfig,
        initialized: appConfigService.initialized,
      }),
      deps: [AppConfigService],
    },
    {
      provide: DndItemModels.Service.DND_ITEM_API_SERVICE_CONFIG_TOKEN,
      useFactory: (appConfigService: AppConfigService) => ({
        appConfig: appConfigService.appConfig,
        initialized: appConfigService.initialized,
      }),
      deps: [AppConfigService],
    },
    {
      provide: DndCharacterModels.Service.DND_CHARACTER_API_SERVICE_CONFIG_TOKEN,
      useFactory: (appConfigService: AppConfigService) => ({
        appConfig: appConfigService.appConfig,
        initialized: appConfigService.initialized,
      }),
      deps: [AppConfigService],
    },
    {
      provide: DndCampaignModels.Service.DND_CAMPAIGN_API_SERVICE_CONFIG_TOKEN,
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
        authGuardAuthAppRouteBase: ['/', 'auth'],
        alreadyLoggedInGuardRedirectRoute: ['/', 'dnd'],
      }),
      deps: [AppConfigService],
      // useValue: { baseUrl: '/ttrpg-dnd-api' },
    },
    {
      provide: SHARED_THEME_SERVICE_CONFIG_TOKEN,
      useValue: { themes },
    },
    {
      provide: SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN,
      useValue: { namespace: 'ttrpg-dnd' },
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
