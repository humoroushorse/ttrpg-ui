export enum ViewMode {
  Table = 'table',
  Card = 'card',
}

export interface NotificationPreferences {
  enableDesktop: boolean;
  enableInApp: boolean;
  enableSound: boolean;
  workItemUpdates: boolean;
  sprintUpdates: boolean;
  comments: boolean;
  mentions: boolean;
}

export interface DisplayPreferences {
  workItemsViewMode: ViewMode;
  sprintsViewMode: ViewMode;
  showCompletedItems: boolean;
  compactMode: boolean;
  itemsPerPage: number;
}

export interface AccessibilityPreferences {
  highContrast: boolean;
  reduceMotion: boolean;
  largeFonts: boolean;
  keyboardShortcuts: boolean;
}

export interface UserPreferences {
  theme: string;
  language: string;
  notifications: NotificationPreferences;
  display: DisplayPreferences;
  accessibility: AccessibilityPreferences;
  lastUpdated: string;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enableDesktop: false,
  enableInApp: true,
  enableSound: false,
  workItemUpdates: true,
  sprintUpdates: true,
  comments: true,
  mentions: true,
};

export const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  workItemsViewMode: ViewMode.Table,
  sprintsViewMode: ViewMode.Card,
  showCompletedItems: true,
  compactMode: false,
  itemsPerPage: 25,
};

export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = {
  highContrast: false,
  reduceMotion: false,
  largeFonts: false,
  keyboardShortcuts: true,
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'default',
  language: 'en',
  notifications: DEFAULT_NOTIFICATION_PREFERENCES,
  display: DEFAULT_DISPLAY_PREFERENCES,
  accessibility: DEFAULT_ACCESSIBILITY_PREFERENCES,
  lastUpdated: new Date().toISOString(),
};
