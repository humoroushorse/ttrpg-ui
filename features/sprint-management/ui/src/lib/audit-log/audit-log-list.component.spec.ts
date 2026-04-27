import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { vi } from 'vitest';
import { AuditLogListComponent } from './audit-log-list.component';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { AuditAction } = SprintModels.AuditLog;
type AuditLog = SprintModels.AuditLog.AuditLog;

const makeLog = (overrides: Partial<AuditLog> = {}): AuditLog => ({
  id: '1',
  entity_type: 'work_item',
  entity_id: 'wi-1',
  action: AuditAction.Updated,
  user_id: 'user-1',
  user_name: 'Alice',
  changes: {},
  timestamp: new Date().toISOString(),
  ...overrides,
});

describe('AuditLogListComponent', () => {
  let component: AuditLogListComponent;
  let fixture: ComponentFixture<AuditLogListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditLogListComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditLogListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('logs', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders empty state when no logs provided', () => {
    fixture.componentRef.setInput('logs', []);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.empty-state-card')).toBeTruthy();
  });

  it('renders log entries when logs are provided', () => {
    const logs = [makeLog({ id: '1' }), makeLog({ id: '2' })];
    fixture.componentRef.setInput('logs', logs);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const cards = el.querySelectorAll('.audit-log-card');
    expect(cards.length).toBe(2);
  });

  it('applies status-change-card class for StatusChanged action', () => {
    const log = makeLog({ action: AuditAction.StatusChanged });
    fixture.componentRef.setInput('logs', [log]);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.status-change-card')).toBeTruthy();
  });

  it('does not apply status-change-card class for non-status actions', () => {
    const log = makeLog({ action: AuditAction.Updated });
    fixture.componentRef.setInput('logs', [log]);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.status-change-card')).toBeNull();
  });

  describe('getChangesEntries', () => {
    it('parses old/new value pairs correctly', () => {
      const log = makeLog({
        changes: { status: { old: 'todo', new: 'in_progress' } },
      });
      const entries = component.getChangesEntries(log);
      expect(entries.length).toBe(1);
      expect(entries[0].isSimple).toBe(false);
      expect(entries[0].oldValue).toBe('todo');
      expect(entries[0].newValue).toBe('in_progress');
    });

    it('handles simple value format', () => {
      const log = makeLog({ changes: { title: 'New Title' } });
      const entries = component.getChangesEntries(log);
      expect(entries.length).toBe(1);
      expect(entries[0].isSimple).toBe(true);
      expect(entries[0].oldValue).toBeNull();
      expect(entries[0].newValue).toBe('New Title');
    });

    it('returns empty array when changes is empty', () => {
      const log = makeLog({ changes: {} });
      expect(component.getChangesEntries(log)).toEqual([]);
    });

    it('formats key names with title case', () => {
      const log = makeLog({ changes: { story_points: 5 } });
      const entries = component.getChangesEntries(log);
      expect(entries[0].key).toBe('Story Points');
    });
  });

  describe('formatTimestamp', () => {
    it('returns "Just now" for very recent timestamps', () => {
      const result = component.formatTimestamp(new Date().toISOString());
      expect(result).toBe('Just now');
    });

    it('returns minutes ago for timestamps within the last hour', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const result = component.formatTimestamp(fiveMinutesAgo);
      expect(result).toBe('5 minutes ago');
    });

    it('returns hours ago for timestamps within the last day', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const result = component.formatTimestamp(twoHoursAgo);
      expect(result).toBe('2 hours ago');
    });
  });

  describe('isStatusChange', () => {
    it('returns true for StatusChanged action', () => {
      const log = makeLog({ action: AuditAction.StatusChanged });
      expect(component.isStatusChange(log)).toBe(true);
    });

    it('returns false for other actions', () => {
      const log = makeLog({ action: AuditAction.Updated });
      expect(component.isStatusChange(log)).toBe(false);
    });
  });

  describe('applyFilters', () => {
    it('emits filterChange with form values on applyFilters', () => {
      const spy = vi.spyOn(component.filterChange, 'emit');
      component.filterForm.setValue({
        user_id: 'user-42',
        action: null,
        start_date: null,
        end_date: null,
      });
      component.applyFilters();
      expect(spy).toHaveBeenCalledWith({ user_id: 'user-42' });
    });

    it('emits empty filter on clearFilters', () => {
      const spy = vi.spyOn(component.filterChange, 'emit');
      component.clearFilters();
      expect(spy).toHaveBeenCalledWith({});
    });
  });
});
