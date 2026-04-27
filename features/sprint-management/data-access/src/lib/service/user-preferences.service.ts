import { inject, Injectable, signal, Signal, effect, computed } from '@angular/core';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { DEFAULT_USER_PREFERENCES } = SprintModels.UserPreferences;
type UserPreferences = SprintModels.UserPreferences.UserPreferences;
type NotificationPreferences = SprintModels.UserPreferences.NotificationPreferences;
type DisplayPreferences = SprintModels.UserPreferences.DisplayPreferences;
type AccessibilityPreferences = SprintModels.UserPreferences.AccessibilityPreferences;
type ViewMode = SprintModels.UserPreferences.ViewMode;

@Injectable({
  providedIn: 'root',
})
export class UserPreferencesService {
  private readonly localStorageService = inject(SharedLocalStorageService);
  private readonly STORAGE_KEY = 'UserPreferencesService.preferences';

  private readonly preferences = signal<UserPreferences>(DEFAULT_USER_PREFERENCES);

  constructor() {
    this.loadPreferences();

    effect(() => {
      const prefs = this.preferences();
      this.saveToStorage(prefs);
    });
  }

  getPreferences(): Signal<UserPreferences> {
    return this.preferences.asReadonly();
  }

  getTheme(): Signal<string> {
    return computed(() => this.preferences().theme);
  }

  getLanguage(): Signal<string> {
    return computed(() => this.preferences().language);
  }

  getNotificationPreferences(): Signal<NotificationPreferences> {
    return computed(() => this.preferences().notifications);
  }

  getDisplayPreferences(): Signal<DisplayPreferences> {
    return computed(() => this.preferences().display);
  }

  getAccessibilityPreferences(): Signal<AccessibilityPreferences> {
    return computed(() => this.preferences().accessibility);
  }

  updatePreferences(preferences: Partial<UserPreferences>): void {
    this.preferences.update((current) => ({
      ...current,
      ...preferences,
      lastUpdated: new Date().toISOString(),
    }));
  }

  setTheme(theme: string): void {
    this.preferences.update((current) => ({
      ...current,
      theme,
      lastUpdated: new Date().toISOString(),
    }));
  }

  setLanguage(language: string): void {
    this.preferences.update((current) => ({
      ...current,
      language,
      lastUpdated: new Date().toISOString(),
    }));
  }

  updateNotificationPreferences(notifications: Partial<NotificationPreferences>): void {
    this.preferences.update((current) => ({
      ...current,
      notifications: {
        ...current.notifications,
        ...notifications,
      },
      lastUpdated: new Date().toISOString(),
    }));
  }

  updateDisplayPreferences(display: Partial<DisplayPreferences>): void {
    this.preferences.update((current) => ({
      ...current,
      display: {
        ...current.display,
        ...display,
      },
      lastUpdated: new Date().toISOString(),
    }));
  }

  updateAccessibilityPreferences(accessibility: Partial<AccessibilityPreferences>): void {
    this.preferences.update((current) => ({
      ...current,
      accessibility: {
        ...current.accessibility,
        ...accessibility,
      },
      lastUpdated: new Date().toISOString(),
    }));
  }

  setWorkItemsViewMode(viewMode: ViewMode): void {
    this.updateDisplayPreferences({ workItemsViewMode: viewMode });
  }

  setSprintsViewMode(viewMode: ViewMode): void {
    this.updateDisplayPreferences({ sprintsViewMode: viewMode });
  }

  resetToDefaults(): void {
    this.preferences.set({
      ...DEFAULT_USER_PREFERENCES,
      lastUpdated: new Date().toISOString(),
    });
  }

  private loadPreferences(): void {
    const stored = this.localStorageService.get<UserPreferences>(this.STORAGE_KEY);
    if (stored) {
      this.preferences.set({
        ...DEFAULT_USER_PREFERENCES,
        ...stored,
        notifications: {
          ...DEFAULT_USER_PREFERENCES.notifications,
          ...stored.notifications,
        },
        display: {
          ...DEFAULT_USER_PREFERENCES.display,
          ...stored.display,
        },
        accessibility: {
          ...DEFAULT_USER_PREFERENCES.accessibility,
          ...stored.accessibility,
        },
      });
    }
  }

  private saveToStorage(preferences: UserPreferences): void {
    this.localStorageService.set(this.STORAGE_KEY, preferences);
  }

  exportPreferences(): string {
    return JSON.stringify(this.preferences(), null, 2);
  }

  importPreferences(json: string): boolean {
    try {
      const imported = JSON.parse(json) as UserPreferences;
      this.preferences.set({
        ...imported,
        lastUpdated: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Failed to import preferences:', error);
      return false;
    }
  }
}
