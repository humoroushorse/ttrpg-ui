import { TestBed } from '@angular/core/testing';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';
import { UserPreferencesService } from './user-preferences.service';
import {
  SprintModels,
} from '@ttrpg-ui/features/sprint-management/models';

const { DEFAULT_USER_PREFERENCES, ViewMode } = SprintModels.UserPreferences;

describe('UserPreferencesService', () => {
  let service: UserPreferencesService;
  let localStorageService: SharedLocalStorageService;

  beforeEach(() => {
    // Clear any existing storage before each test
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }

    TestBed.configureTestingModule({
      providers: [
        UserPreferencesService,
        SharedLocalStorageService,
        {
          provide: SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN,
          useValue: { namespace: 'test-sprint-management' },
        },
      ],
    });

    localStorageService = TestBed.inject(SharedLocalStorageService);
    service = TestBed.inject(UserPreferencesService);
  });

  afterEach(() => {
    localStorageService.clearNamespace();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default preferences on initialization', () => {
    const prefs = service.getPreferences()();
    expect(prefs).toBeTruthy();
    expect(prefs.theme).toBeDefined();
    expect(prefs.language).toBeDefined();
  });

  it('should update theme preference', () => {
    service.setTheme('dark');
    const theme = service.getTheme()();
    expect(theme).toBe('dark');
  });

  it('should update language preference', () => {
    service.setLanguage('es');
    const language = service.getLanguage()();
    expect(language).toBe('es');
  });

  it('should update notification preferences', () => {
    service.updateNotificationPreferences({ enableDesktop: true });
    const notificationPrefs = service.getNotificationPreferences()();
    expect(notificationPrefs.enableDesktop).toBe(true);
  });

  it('should update display preferences', () => {
    service.updateDisplayPreferences({ compactMode: true });
    const displayPrefs = service.getDisplayPreferences()();
    expect(displayPrefs.compactMode).toBe(true);
  });

  it('should update accessibility preferences', () => {
    service.updateAccessibilityPreferences({ highContrast: true });
    const accessibilityPrefs = service.getAccessibilityPreferences()();
    expect(accessibilityPrefs.highContrast).toBe(true);
  });

  it('should set work items view mode', () => {
    service.setWorkItemsViewMode(ViewMode.Card);
    const displayPrefs = service.getDisplayPreferences()();
    expect(displayPrefs.workItemsViewMode).toBe(ViewMode.Card);
  });

  it('should set sprints view mode', () => {
    service.setSprintsViewMode(ViewMode.Table);
    const displayPrefs = service.getDisplayPreferences()();
    expect(displayPrefs.sprintsViewMode).toBe(ViewMode.Table);
  });

  it('should reset to defaults', () => {
    // Make some changes
    service.setTheme('custom');
    service.setLanguage('fr');
    service.updateDisplayPreferences({ compactMode: true });

    // Reset
    service.resetToDefaults();

    // Verify reset
    const prefs = service.getPreferences()();
    expect(prefs.theme).toBe(DEFAULT_USER_PREFERENCES.theme);
    expect(prefs.language).toBe(DEFAULT_USER_PREFERENCES.language);
    expect(prefs.display.compactMode).toBe(DEFAULT_USER_PREFERENCES.display.compactMode);
  });

  it('should export preferences as JSON', () => {
    const json = service.exportPreferences();
    expect(json).toBeTruthy();
    expect(typeof json).toBe('string');
    const parsed = JSON.parse(json);
    expect(parsed.theme).toBeDefined();
    expect(parsed.language).toBeDefined();
  });

  it('should import preferences from JSON', () => {
    const testPrefs = {
      ...DEFAULT_USER_PREFERENCES,
      theme: 'imported-theme',
      language: 'de',
    };
    const json = JSON.stringify(testPrefs);

    const success = service.importPreferences(json);
    expect(success).toBe(true);

    const prefs = service.getPreferences()();
    expect(prefs.theme).toBe('imported-theme');
    expect(prefs.language).toBe('de');
  });

  it('should handle invalid JSON import gracefully', () => {
    const success = service.importPreferences('invalid json');
    expect(success).toBe(false);
  });
});
