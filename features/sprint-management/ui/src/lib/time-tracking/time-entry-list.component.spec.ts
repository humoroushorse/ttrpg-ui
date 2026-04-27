import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TimeEntryListComponent } from './time-entry-list.component';
import { ComponentRef } from '@angular/core';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

type TimeEntry = SprintModels.TimeTracking.TimeEntry;

const makeEntry = (overrides: Partial<TimeEntry> = {}): TimeEntry => ({
  id: 'te-1',
  work_item_id: 'wi-1',
  user_id: 'user-1',
  hours: 2,
  description: 'Test work',
  date: '2024-01-15',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  ...overrides,
});

describe('TimeEntryListComponent', () => {
  let component: TimeEntryListComponent;
  let componentRef: ComponentRef<TimeEntryListComponent>;
  let fixture: ComponentFixture<TimeEntryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeEntryListComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeEntryListComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('entries', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show empty state when no entries', () => {
    expect(component.sortedEntries().length).toBe(0);
  });

  it('should sort entries by date descending', () => {
    componentRef.setInput('entries', [
      makeEntry({ id: 'te-1', date: '2024-01-10' }),
      makeEntry({ id: 'te-2', date: '2024-01-20' }),
      makeEntry({ id: 'te-3', date: '2024-01-15' }),
    ]);
    fixture.detectChanges();

    const sorted = component.sortedEntries();
    expect(sorted[0].id).toBe('te-2');
    expect(sorted[1].id).toBe('te-3');
    expect(sorted[2].id).toBe('te-1');
  });

  it('should emit editEntry when edit clicked', () => {
    const entry = makeEntry();
    let emitted: TimeEntry | null = null;
    component.editEntry.subscribe((e: TimeEntry) => (emitted = e));

    component.onEditClick(entry);
    expect(emitted).toBe(entry);
  });

  it('should emit deleteEntry when delete clicked', () => {
    const entry = makeEntry();
    let emitted: TimeEntry | null = null;
    component.deleteEntry.subscribe((e: TimeEntry) => (emitted = e));

    component.onDeleteClick(entry);
    expect(emitted).toBe(entry);
  });

  it('should format date correctly', () => {
    const formatted = component.formatDate('2024-01-15');
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2024');
  });

  it('should allow modification when no currentUserId set', () => {
    const entry = makeEntry({ user_id: 'any-user' });
    expect(component.canModify(entry)).toBe(true);
  });

  it('should allow modification when user matches', () => {
    componentRef.setInput('currentUserId', 'user-1');
    fixture.detectChanges();

    const entry = makeEntry({ user_id: 'user-1' });
    expect(component.canModify(entry)).toBe(true);
  });

  it('should deny modification when user does not match', () => {
    componentRef.setInput('currentUserId', 'user-2');
    fixture.detectChanges();

    const entry = makeEntry({ user_id: 'user-1' });
    expect(component.canModify(entry)).toBe(false);
  });
});
