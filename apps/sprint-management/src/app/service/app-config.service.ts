import { Injectable, signal, PLATFORM_ID, inject, makeStateKey, TransferState } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AppConfig } from '../models/models';
import { HttpClient } from '@angular/common/http';
import { LocationStrategy } from '@angular/common';

const APP_CONFIG_KEY = makeStateKey<Partial<AppConfig>>('app-config');

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly transferState = inject(TransferState);
  public initialized = signal<boolean>(false);
  public appConfig = signal<Partial<AppConfig>>({});

  initializerFactory(httpClient: HttpClient, locationStrategy: LocationStrategy): Promise<Partial<AppConfig>> {
    const baseHref = locationStrategy.getBaseHref();
    const defaultConfig: Partial<AppConfig> = {
      APP_SPRINT_MANAGEMENT__API_BASE_PATH: `${baseHref}sprint-management-api`,
      APP_SPRINT_MANAGEMENT__API_URL: 'http://localhost:8003',
      AUTH_BASE_URL: `${baseHref}auth-api`,
    };

    if (!isPlatformBrowser(this.platformId)) {
      const serverConfig: Partial<AppConfig> = {
        APP_SPRINT_MANAGEMENT__API_BASE_PATH:
          process.env['APP_SPRINT_MANAGEMENT__API_BASE_PATH'] || defaultConfig.APP_SPRINT_MANAGEMENT__API_BASE_PATH,
        APP_SPRINT_MANAGEMENT__API_URL:
          process.env['APP_SPRINT_MANAGEMENT__API_URL'] || defaultConfig.APP_SPRINT_MANAGEMENT__API_URL,
        AUTH_BASE_URL: process.env['AUTH_BASE_URL'] || defaultConfig.AUTH_BASE_URL,
      };

      this.transferState.set(APP_CONFIG_KEY, serverConfig);
      this.appConfig.set(serverConfig);
      this.initialized.set(true);
      return Promise.resolve(serverConfig);
    }

    const config = this.transferState.get(APP_CONFIG_KEY, defaultConfig);

    this.transferState.remove(APP_CONFIG_KEY);

    this.appConfig.set(config);
    this.initialized.set(true);
    return Promise.resolve(config);
  }
}
