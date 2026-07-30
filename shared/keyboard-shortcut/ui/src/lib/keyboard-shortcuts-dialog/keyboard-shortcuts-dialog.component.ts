import { Component, inject, computed } from '@angular/core';

import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { KeyboardShortcutService } from '@ttrpg-ui/shared/keyboard-shortcut/data-access';

/**
 * Dialog component that displays all registered keyboard shortcuts
 * grouped by context/category
 *
 * Features:
 * - Displays shortcuts grouped by context (Work Items, Sprints, Global, etc.)
 * - Shows key combinations and descriptions
 * - Responsive layout
 * - Accessible with ARIA labels
 */
@Component({
  selector: 'lib-keyboard-shortcuts-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './keyboard-shortcuts-dialog.component.html',
  styleUrls: ['./keyboard-shortcuts-dialog.component.css'],
})
export class KeyboardShortcutsDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<KeyboardShortcutsDialogComponent>);
  private readonly keyboardShortcutService = inject(KeyboardShortcutService);

  // Get grouped shortcuts from the service
  readonly groupedShortcuts = this.keyboardShortcutService.groupedShortcuts;

  // Get context names sorted alphabetically
  readonly contexts = computed(() => {
    const shortcuts = this.groupedShortcuts();
    return Object.keys(shortcuts).sort();
  });

  /**
   * Close the dialog
   */
  close(): void {
    this.dialogRef.close();
  }

  /**
   * Format a key combination for display
   * Converts technical key names to user-friendly display
   *
   * @param key The key combination string
   * @returns Formatted key combination
   */
  formatKey(key: string): string {
    return key.replace('Ctrl', '⌃').replace('Cmd', '⌘').replace('Alt', '⌥').replace('Shift', '⇧').replace('+', ' + ');
  }
}
