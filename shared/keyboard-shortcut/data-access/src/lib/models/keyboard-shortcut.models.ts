/**
 * Keyboard shortcut models for the keyboard shortcut service
 */

/**
 * Represents a keyboard shortcut configuration
 */
export interface KeyboardShortcut {
  /** Unique identifier for the shortcut */
  id: string;
  /** Key combination (e.g., 'c', 'Ctrl+K', 'Cmd+K', '?') */
  key: string;
  /** Description of what the shortcut does */
  description: string;
  /** Context/category for grouping shortcuts (e.g., 'Work Items', 'Sprints', 'Global') */
  context: string;
  /** Callback function to execute when shortcut is triggered */
  handler: (event: KeyboardEvent) => void;
  /** Whether the shortcut is currently enabled */
  enabled?: boolean;
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean;
  /** Whether to stop event propagation */
  stopPropagation?: boolean;
}

/**
 * Grouped shortcuts by context for display purposes
 */
export interface GroupedShortcuts {
  [context: string]: KeyboardShortcut[];
}

/**
 * Keyboard event filter options
 */
export interface KeyboardEventFilter {
  /** Whether to ignore events from input elements */
  ignoreInputs?: boolean;
  /** Whether to ignore events from textarea elements */
  ignoreTextareas?: boolean;
  /** Whether to ignore events from contenteditable elements */
  ignoreContentEditable?: boolean;
  /** Custom filter function */
  customFilter?: (event: KeyboardEvent) => boolean;
}
