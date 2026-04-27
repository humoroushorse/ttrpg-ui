import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserPreferencesService } from '@ttrpg-ui/features/sprint-management/data-access';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { ViewMode } = SprintModels.UserPreferences;
type UserPreferences = SprintModels.UserPreferences.UserPreferences;
type ViewMode = SprintModels.UserPreferences.ViewMode;
type NotificationPreferences = SprintModels.UserPreferences.NotificationPreferences;
type DisplayPreferences = SprintModels.UserPreferences.DisplayPreferences;
type AccessibilityPreferences = SprintModels.UserPreferences.AccessibilityPreferences;
import { SharedThemeService } from '@ttrpg-ui/shared/theme/data-access';

/**
 * User Preferences Dialog Component
 *
 * Provides a dialog for users to edit their preferences including:
 * - Theme selection
 * - Language selection
 * - Notification settings
 * - Display settings
 * - Accessibility settings
 *
 */
@Component({
  selector: 'lib-user-preferences-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatIconModule,
    MatDividerModule,
    MatInputModule,
    MatTooltipModule,
  ],
  templateUrl: './user-preferences-dialog.component.html',
  styleUrls: ['./user-preferences-dialog.component.scss'],
})
export class UserPreferencesDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<UserPreferencesDialogComponent>);
  private readonly preferencesService = inject(UserPreferencesService);
  private readonly themeService = inject(SharedThemeService);

  // Local copy of preferences for editing
  protected readonly preferences = signal<UserPreferences>(structuredClone(this.preferencesService.getPreferences()()));

  // Available themes from theme service
  protected readonly availableThemes = this.themeService.getThemes();

  // Available languages (can be expanded)
  protected readonly availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ja', name: '日本語' },
    { code: 'zh', name: '中文' },
  ];

  // View mode options
  protected readonly viewModes = [
    { value: ViewMode.Table, label: 'Table View' },
    { value: ViewMode.Card, label: 'Card View' },
  ];

  // Items per page options
  protected readonly itemsPerPageOptions = [10, 25, 50, 100];

  // Track if preferences have been modified
  protected readonly hasChanges = signal<boolean>(false);

  /**
   * Update notification preferences
   */
  protected updateNotifications(updates: Partial<NotificationPreferences>): void {
    this.preferences.update((prefs) => ({
      ...prefs,
      notifications: {
        ...prefs.notifications,
        ...updates,
      },
    }));
    this.hasChanges.set(true);
  }

  /**
   * Update display preferences
   */
  protected updateDisplay(updates: Partial<DisplayPreferences>): void {
    this.preferences.update((prefs) => ({
      ...prefs,
      display: {
        ...prefs.display,
        ...updates,
      },
    }));
    this.hasChanges.set(true);
  }

  /**
   * Update accessibility preferences
   */
  protected updateAccessibility(updates: Partial<AccessibilityPreferences>): void {
    this.preferences.update((prefs) => ({
      ...prefs,
      accessibility: {
        ...prefs.accessibility,
        ...updates,
      },
    }));
    this.hasChanges.set(true);
  }

  /**
   * Update theme preference
   */
  protected updateTheme(theme: string): void {
    this.preferences.update((prefs) => ({
      ...prefs,
      theme,
    }));
    this.hasChanges.set(true);
  }

  /**
   * Update language preference
   */
  protected updateLanguage(language: string): void {
    this.preferences.update((prefs) => ({
      ...prefs,
      language,
    }));
    this.hasChanges.set(true);
  }

  /**
   * Save preferences and close dialog
   */
  protected save(): void {
    this.preferencesService.updatePreferences(this.preferences());

    // Update theme if changed
    const selectedTheme = this.availableThemes().find((t) => t.path === this.preferences().theme);
    if (selectedTheme) {
      this.themeService.setTheme(selectedTheme);
    }

    this.dialogRef.close(true);
  }

  /**
   * Cancel and close dialog without saving
   */
  protected cancel(): void {
    this.dialogRef.close(false);
  }

  /**
   * Reset preferences to defaults
   */
  protected resetToDefaults(): void {
    if (confirm('Are you sure you want to reset all preferences to defaults?')) {
      this.preferencesService.resetToDefaults();
      this.preferences.set(structuredClone(this.preferencesService.getPreferences()()));
      this.hasChanges.set(false);
    }
  }

  /**
   * Export preferences as JSON
   */
  protected exportPreferences(): void {
    const json = this.preferencesService.exportPreferences();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sprint-management-preferences-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import preferences from JSON file
   */
  protected importPreferences(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const json = e.target?.result as string;
      const success = this.preferencesService.importPreferences(json);
      if (success) {
        this.preferences.set(structuredClone(this.preferencesService.getPreferences()()));
        this.hasChanges.set(false);
        alert('Preferences imported successfully!');
      } else {
        alert('Failed to import preferences. Please check the file format.');
      }
    };
    reader.readAsText(file);
  }
}
