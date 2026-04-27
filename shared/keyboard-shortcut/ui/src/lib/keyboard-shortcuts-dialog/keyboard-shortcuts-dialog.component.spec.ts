import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { KeyboardShortcutsDialogComponent } from './keyboard-shortcuts-dialog.component';
import { KeyboardShortcutService } from '@ttrpg-ui/shared/keyboard-shortcut/data-access';

describe('KeyboardShortcutsDialogComponent', () => {
  let component: KeyboardShortcutsDialogComponent;
  let fixture: ComponentFixture<KeyboardShortcutsDialogComponent>;
  let mockDialogRef: Partial<MatDialogRef<KeyboardShortcutsDialogComponent>>;
  let keyboardShortcutService: KeyboardShortcutService;

  beforeEach(async () => {
    mockDialogRef = {
      close: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [KeyboardShortcutsDialogComponent],
      providers: [{ provide: MatDialogRef, useValue: mockDialogRef }, KeyboardShortcutService],
    }).compileComponents();

    fixture = TestBed.createComponent(KeyboardShortcutsDialogComponent);
    component = fixture.componentInstance;
    keyboardShortcutService = TestBed.inject(KeyboardShortcutService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog when close is called', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should display grouped shortcuts', () => {
    const handler = vi.fn();

    keyboardShortcutService.register({
      id: 'test-1',
      key: 'c',
      description: 'Create item',
      context: 'Work Items',
      handler,
    });

    keyboardShortcutService.register({
      id: 'test-2',
      key: 's',
      description: 'Create sprint',
      context: 'Sprints',
      handler,
    });

    fixture.detectChanges();

    const contexts = component.contexts();
    expect(contexts).toContain('Work Items');
    expect(contexts).toContain('Sprints');
  });

  it('should format key combinations correctly', () => {
    expect(component.formatKey('Ctrl+K')).toBe('⌃ + K');
    expect(component.formatKey('Cmd+K')).toBe('⌘ + K');
    expect(component.formatKey('Alt+S')).toBe('⌥ + S');
    expect(component.formatKey('Shift+A')).toBe('⇧ + A');
    expect(component.formatKey('c')).toBe('c');
  });

  it('should sort contexts alphabetically', () => {
    const handler = vi.fn();

    keyboardShortcutService.register({
      id: 'test-1',
      key: 'c',
      description: 'Create',
      context: 'Zebra',
      handler,
    });

    keyboardShortcutService.register({
      id: 'test-2',
      key: 's',
      description: 'Save',
      context: 'Alpha',
      handler,
    });

    fixture.detectChanges();

    const contexts = component.contexts();
    expect(contexts[0]).toBe('Alpha');
    expect(contexts[1]).toBe('Zebra');
  });
});
