import { TestBed } from '@angular/core/testing';
import { KeyboardShortcutService } from './keyboard-shortcut.service';
import { KeyboardShortcut } from '../models/keyboard-shortcut.models';

describe('KeyboardShortcutService', () => {
  let service: KeyboardShortcutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyboardShortcutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should register a shortcut', () => {
      const handler = vi.fn();
      const shortcut: KeyboardShortcut = {
        id: 'test-shortcut',
        key: 'c',
        description: 'Test shortcut',
        context: 'Test',
        handler,
      };

      const registered = service.register(shortcut);

      expect(registered).toBeDefined();
      expect(registered.id).toBe('test-shortcut');
      expect(registered.enabled).toBe(true);
      expect(service.getShortcut('test-shortcut')).toBeDefined();
    });

    it('should set default values for optional properties', () => {
      const handler = vi.fn();
      const shortcut: KeyboardShortcut = {
        id: 'test-shortcut',
        key: 'c',
        description: 'Test shortcut',
        context: 'Test',
        handler,
      };

      const registered = service.register(shortcut);

      expect(registered.enabled).toBe(true);
      expect(registered.preventDefault).toBe(true);
      expect(registered.stopPropagation).toBe(true);
    });
  });

  describe('unregister', () => {
    it('should unregister a shortcut by ID', () => {
      const handler = vi.fn();
      const shortcut: KeyboardShortcut = {
        id: 'test-shortcut',
        key: 'c',
        description: 'Test shortcut',
        context: 'Test',
        handler,
      };

      service.register(shortcut);
      expect(service.getShortcut('test-shortcut')).toBeDefined();

      const result = service.unregister('test-shortcut');

      expect(result).toBe(true);
      expect(service.getShortcut('test-shortcut')).toBeUndefined();
    });

    it('should return false when unregistering non-existent shortcut', () => {
      const result = service.unregister('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('unregisterContext', () => {
    it('should unregister all shortcuts for a context', () => {
      const handler = vi.fn();

      service.register({
        id: 'shortcut-1',
        key: 'c',
        description: 'Shortcut 1',
        context: 'Context1',
        handler,
      });

      service.register({
        id: 'shortcut-2',
        key: 's',
        description: 'Shortcut 2',
        context: 'Context1',
        handler,
      });

      service.register({
        id: 'shortcut-3',
        key: 'a',
        description: 'Shortcut 3',
        context: 'Context2',
        handler,
      });

      const count = service.unregisterContext('Context1');

      expect(count).toBe(2);
      expect(service.getShortcut('shortcut-1')).toBeUndefined();
      expect(service.getShortcut('shortcut-2')).toBeUndefined();
      expect(service.getShortcut('shortcut-3')).toBeDefined();
    });
  });

  describe('setEnabled', () => {
    it('should enable/disable a shortcut', () => {
      const handler = vi.fn();
      const shortcut: KeyboardShortcut = {
        id: 'test-shortcut',
        key: 'c',
        description: 'Test shortcut',
        context: 'Test',
        handler,
      };

      service.register(shortcut);

      service.setEnabled('test-shortcut', false);
      expect(service.getShortcut('test-shortcut')?.enabled).toBe(false);

      service.setEnabled('test-shortcut', true);
      expect(service.getShortcut('test-shortcut')?.enabled).toBe(true);
    });
  });

  describe('groupedShortcuts', () => {
    it('should group shortcuts by context', () => {
      const handler = vi.fn();

      service.register({
        id: 'shortcut-1',
        key: 'c',
        description: 'Create',
        context: 'Work Items',
        handler,
      });

      service.register({
        id: 'shortcut-2',
        key: 's',
        description: 'Create Sprint',
        context: 'Sprints',
        handler,
      });

      service.register({
        id: 'shortcut-3',
        key: 'Ctrl+K',
        description: 'Search',
        context: 'Work Items',
        handler,
      });

      const grouped = service.groupedShortcuts();

      expect(grouped['Work Items']).toHaveLength(2);
      expect(grouped['Sprints']).toHaveLength(1);
    });

    it('should sort shortcuts within each context', () => {
      const handler = vi.fn();

      service.register({
        id: 'shortcut-1',
        key: 's',
        description: 'Second',
        context: 'Test',
        handler,
      });

      service.register({
        id: 'shortcut-2',
        key: 'a',
        description: 'First',
        context: 'Test',
        handler,
      });

      const grouped = service.groupedShortcuts();

      expect(grouped['Test'][0].key).toBe('a');
      expect(grouped['Test'][1].key).toBe('s');
    });
  });

  describe('keyboard event handling', () => {
    it('should filter events from input elements', () => {
      const handler = vi.fn();

      service.register({
        id: 'test-shortcut',
        key: 'c',
        description: 'Test',
        context: 'Test',
        handler,
      });

      const input = document.createElement('input');
      document.body.appendChild(input);

      const event = new KeyboardEvent('keydown', {
        key: 'c',
        bubbles: true,
      });

      input.dispatchEvent(event);

      // Handler should not be called for input elements
      expect(handler).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });

    it('should filter events from textarea elements', () => {
      const handler = vi.fn();

      service.register({
        id: 'test-shortcut',
        key: 'c',
        description: 'Test',
        context: 'Test',
        handler,
      });

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);

      const event = new KeyboardEvent('keydown', {
        key: 'c',
        bubbles: true,
      });

      textarea.dispatchEvent(event);

      // Handler should not be called for textarea elements
      expect(handler).not.toHaveBeenCalled();

      document.body.removeChild(textarea);
    });

    it('should handle keyboard events from non-input elements', () => {
      const handler = vi.fn();

      service.register({
        id: 'test-shortcut',
        key: 'c',
        description: 'Test',
        context: 'Test',
        handler,
      });

      const div = document.createElement('div');
      document.body.appendChild(div);

      const event = new KeyboardEvent('keydown', {
        key: 'c',
        bubbles: true,
      });

      div.dispatchEvent(event);

      // Handler should be called for non-input elements
      expect(handler).toHaveBeenCalledWith(event);

      document.body.removeChild(div);
    });
  });
});
