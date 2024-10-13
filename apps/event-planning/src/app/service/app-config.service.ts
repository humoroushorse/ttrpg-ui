import { Injectable, isDevMode, signal } from '@angular/core';
import { AppConfig } from '../models/models';
import { HttpClient } from '@angular/common/http';
import { LocationStrategy } from '@angular/common';
import { firstValueFrom, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  public initialized = signal<boolean>(false);
  public appConfig = signal<Partial<AppConfig>>({});

  initializerFactory(httpClient: HttpClient, locationStrategy: LocationStrategy) {
    let baseUrl = `${window.location.origin}${locationStrategy.getBaseHref()}`.trim();
    if (!baseUrl.endsWith('/')) baseUrl = baseUrl + '/';
    const assetsUrl = 'assets/app.config.json';

    return (): Promise<Partial<AppConfig>> =>
      firstValueFrom(
        httpClient.get<Partial<AppConfig>>(`${baseUrl}${assetsUrl}`).pipe(
          tap((config) => {
            if (isDevMode()) console.log('AppConfigService.init::', config);
          }),
          tap((config) => {
            this.appConfig.set(config);
            this.initialized.set(true);
          }),
        ),
      );
  }
}
