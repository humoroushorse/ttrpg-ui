import { Injectable, signal, computed, DestroyRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import {
  KeyboardShortcut,
  GroupedShortcuts,
  KeyboardEventFilter,
} from '../models/keyboard-shortcut.models';

/**
 * Service for managing keyboard shortcuts throughout the application
 *
 * Features:
 * - Register/unregister shortcuts with unique IDs
 * - Handle keyboard events with filtering for input fields
 * - Group shortcuts by context for display
 * - Enable/disable shortcuts dynamically
 * - Support for modifier keys (Ctrl, Cmd, Alt, Shift)
 */
@Injectable({
  providedIn: 'root',
})
export class KeyboardShortcutService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Map of registered shortcuts by ID
  private readonly shortcuts = signal<Map<string, KeyboardShortcut>>(new Map());

  // Default event filter options
  private readonly defaultFilter: KeyboardEventFilter = {
    ignoreInputs: true,
    ignoreTextareas: true,
    ignoreContentEditable: true,
  };

  // Computed signal for grouped shortcuts
  readonly groupedShortcuts = computed<GroupedShortcuts>(() => {
    const shortcuts = this.shortcuts();
    const grouped: GroupedShortcuts = {};

    shortcuts.forEach((shortcut) => {
      if (!grouped[shortcut.context]) {
        grouped[shortcut.context] = [];
      }
      grouped[shortcut.context].push(shortcut);
    });

    // Sort shortcuts within each context by key
    Object.keys(grouped).forEach((context) => {
      grouped[context].sort((a, b) => a.key.localeCompare(b.key));
    });

    return grouped;
  });

  // Computed signal for all shortcuts as array
  readonly allShortcuts = computed<KeyboardShortcut[]>(() => {
    return Array.from(this.shortcuts().values());
  });

  constructor() {
    this.initializeKeyboardListener();
  }

  /**
   * Initialize global keyboard event listener
   */
  private initializeKeyboardListener(): void {
    if (!this.isBrowser) {
      return;
    }

    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        filter((event) => this.shouldProcessEvent(event)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.handleKeyboardEvent(event);
      });
  }

  /**
   * Register a new keyboard shortcut
   *
   * @param shortcut The shortcut configuration to register
   * @returns The registered shortcut
   */
  register(shortcut: KeyboardShortcut): KeyboardShortcut {
    const shortcuts = new Map(this.shortcuts());

    // Set default values
    const fullShortcut: KeyboardShortcut = {
      ...shortcut,
      enabled: shortcut.enabled ?? true,
      preventDefault: shortcut.preventDefault ?? true,
      stopPropagation: shortcut.stopPropagation ?? true,
    };

    shortcuts.set(shortcut.id, fullShortcut);
    this.shortcuts.set(shortcuts);

    return fullShortcut;
  }

  /**
   * Unregister a keyboard shortcut by ID
   *
   * @param id The ID of the shortcut to unregister
   * @returns True if the shortcut was found and removed
   */
  unregister(id: string): boolean {
    const shortcuts = new Map(this.shortcuts());
    const result = shortcuts.delete(id);

    if (result) {
      this.shortcuts.set(shortcuts);
    }

    return result;
  }

  /**
   * Unregister all shortcuts for a specific context
   *
   * @param context The context to clear shortcuts for
   * @returns The number of shortcuts removed
   */
  unregisterContext(context: string): number {
    const shortcuts = new Map(this.shortcuts());
    let count = 0;

    shortcuts.forEach((shortcut, id) => {
      if (shortcut.context === context) {
        shortcuts.delete(id);
        count++;
      }
    });

    if (count > 0) {
      this.shortcuts.set(shortcuts);
    }

    return count;
  }

  /**
   * Enable or disable a specific shortcut
   *
   * @param id The ID of the shortcut
   * @param enabled Whether the shortcut should be enabled
   */
  setEnabled(id: string, enabled: boolean): void {
    const shortcuts = new Map(this.shortcuts());
    const shortcut = shortcuts.get(id);

    if (shortcut) {
      shortcuts.set(id, { ...shortcut, enabled });
      this.shortcuts.set(shortcuts);
    }
  }

  /**
   * Get a shortcut by ID
   *
   * @param id The ID of the shortcut
   * @returns The shortcut or undefined if not found
   */
  getShortcut(id: string): KeyboardShortcut | undefined {
    return this.shortcuts().get(id);
  }

  /**
   * Check if an event should be processed based on filter rules
   *
   * @param event The keyboard event
   * @returns True if the event should be processed
   */
  private shouldProcessEvent(event: KeyboardEvent): boolean {
    const target = event.target as HTMLElement;

    // Check if event is from an input field
    if (this.defaultFilter.ignoreInputs && target.tagName === 'INPUT') {
      return false;
    }

    // Check if event is from a textarea
    if (this.defaultFilter.ignoreTextareas && target.tagName === 'TEXTAREA') {
      return false;
    }

    // Check if event is from a contenteditable element
    if (this.defaultFilter.ignoreContentEditable && target.isContentEditable) {
      return false;
    }

    return true;
  }

  /**
   * Handle keyboard event and trigger matching shortcuts
   *
   * @param event The keyboard event
   */
  private handleKeyboardEvent(event: KeyboardEvent): void {
    const keyCombo = this.getKeyCombo(event);
    const shortcuts = this.shortcuts();

    shortcuts.forEach((shortcut) => {
      if (shortcut.enabled && this.matchesShortcut(keyCombo, shortcut.key)) {
        if (shortcut.preventDefault) {
          event.preventDefault();
        }
        if (shortcut.stopPropagation) {
          event.stopPropagation();
        }

        shortcut.handler(event);
      }
    });
  }

  /**
   * Get the key combination string from a keyboard event
   *
   * @param event The keyboard event
   * @returns The key combination string (e.g., 'Ctrl+K', 'c', '?')
   */
  private getKeyCombo(event: KeyboardEvent): string {
    const parts: string[] = [];

    // Add modifiers (in consistent order)
    if (event.ctrlKey || event.metaKey) {
      // Use Ctrl for both Ctrl and Cmd for cross-platform compatibility
      parts.push('Ctrl');
    }
    if (event.altKey) {
      parts.push('Alt');
    }
    if (event.shiftKey && event.key.length > 1) {
      // Only add Shift if it's not just for capitalizing a letter
      parts.push('Shift');
    }

    // Add the main key
    parts.push(event.key);

    return parts.join('+');
  }

  /**
   * Check if a key combination matches a shortcut key
   *
   * @param keyCombo The key combination from the event
   * @param shortcutKey The shortcut key to match against
   * @returns True if they match
   */
  private matchesShortcut(keyCombo: string, shortcutKey: string): boolean {
    // Normalize both strings for comparison
    const normalizedCombo = this.normalizeKeyCombo(keyCombo);
    const normalizedShortcut = this.normalizeKeyCombo(shortcutKey);

    return normalizedCombo === normalizedShortcut;
  }

  /**
   * Normalize a key combination string for comparison
   *
   * @param keyCombo The key combination to normalize
   * @returns The normalized key combination
   */
  private normalizeKeyCombo(keyCombo: string): string {
    // Replace Cmd with Ctrl for cross-platform compatibility
    const normalized = keyCombo.replace('Cmd', 'Ctrl');

    // Split, sort modifiers, and rejoin
    const parts = normalized.split('+');
    const modifiers = parts.slice(0, -1).sort();
    const key = parts[parts.length - 1];

    return [...modifiers, key].join('+').toLowerCase();
  }
}
