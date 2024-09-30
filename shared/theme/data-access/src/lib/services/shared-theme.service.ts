import { Inject, inject, Injectable, Signal, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AppTheme, SharedThemeServiceConfig, SHARED_THEME_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/theme/models';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';

@Injectable({
  providedIn: 'root',
})
export class SharedThemeService {
  private document: Document = inject(DOCUMENT);

  private sharedLocalStorageService = inject(SharedLocalStorageService);

  private themes$ = signal<AppTheme[]>([]);

  private activeTheme$ = signal<AppTheme | null>(null);

  constructor(@Inject(SHARED_THEME_SERVICE_CONFIG_TOKEN) config: SharedThemeServiceConfig) {
    this.themes$.set(config.themes);

    const storageActiveTheme = this.sharedLocalStorageService.get<AppTheme>(this.getLocalStorageKey('activeTheme$'));

    this.activeTheme$.set(storageActiveTheme ? storageActiveTheme : this.themes$()[0]);
    this.loadTheme();
  }

  private getLocalStorageKey(key: string) {
    return `SharedThemeService.${key}`;
  }

  getThemes(): Signal<AppTheme[]> {
    return this.themes$.asReadonly();
  }

  getActiveTheme(): Signal<AppTheme | null> {
    return this.activeTheme$.asReadonly();
  }

  loadTheme(): void {
    const head = this.document.getElementsByTagName('head')[0] as HTMLHeadElement;
    const themeLink = this.document.getElementById('theme-link') as HTMLLinkElement;

    if (themeLink) {
      head.removeChild(themeLink);
    }

    const newLink = this.document.createElement('link');
    newLink.id = 'theme-link';
    newLink.rel = 'stylesheet';
    newLink.href = this.activeTheme$()?.path || '';

    head.appendChild(newLink);
  }

  setTheme(theme: AppTheme): void {
    this.sharedLocalStorageService.set<AppTheme>(this.getLocalStorageKey('activeTheme$'), theme);
    this.activeTheme$.set(theme);
    this.loadTheme();
  }
}
