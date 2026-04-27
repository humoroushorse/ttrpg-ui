import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';

import { PageSprintsListComponent } from './page-sprints-list.component';
import { SprintStore } from '@ttrpg-ui/features/sprint-management/data-access';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { KeyboardShortcutService } from '@ttrpg-ui/shared/keyboard-shortcut/data-access';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { SprintStatus } = SprintModels.Sprint;

describe('PageSprintsListComponent', () => {
  let component: PageSprintsListComponent;
  let fixture: ComponentFixture<PageSprintsListComponent>;
  let mockSprintStore: any;
  let mockLocalStorage: any;
  let mockKeyboardService: any;

  const mockSprint = {
    id: 'sprint-1',
    name: 'Sprint 1',
    status: SprintStatus.Active,
    start_date: '2024-01-01',
    end_date: '2024-01-14',
    goal: 'Test sprint',
    project_id: 'project-1',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };

  beforeEach(async () => {
    mockSprintStore = {
      loadSprints: vi.fn(),
      clearFilters: vi.fn(),
      setFilters: vi.fn(),
      setSorts: vi.fn(),
      setPage: vi.fn(),
      setPageSize: vi.fn(),
      entities: signal([mockSprint]),
      loading: signal(false),
      loaded: signal(true),
      error: signal(null),
      pagination: signal({ currentPage: 1, pageSize: 10, totalItems: 1, totalPages: 1 }),
      filters: signal({ filters: [], operator: 'AND' as const }),
      sorts: signal({ sorts: [] }),
    };

    mockLocalStorage = {
      get: vi.fn().mockReturnValue(null),
      set: vi.fn(),
      remove: vi.fn(),
    };

    mockKeyboardService = {
      register: vi.fn(),
      unregisterContext: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PageSprintsListComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SprintStore, useValue: mockSprintStore },
        { provide: SharedLocalStorageService, useValue: mockLocalStorage },
        { provide: KeyboardShortcutService, useValue: mockKeyboardService },
        {
          provide: AuthService,
          useValue: { getUserTokenDecoded: () => signal(null) },
        },
        {
          provide: SharedCoreService,
          useValue: { appTitle: 'Test App' },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageSprintsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should register keyboard shortcuts on init', () => {
    expect(mockKeyboardService.register).toHaveBeenCalled();
  });

  it('should unregister keyboard shortcuts on destroy', () => {
    component.ngOnDestroy();
    expect(mockKeyboardService.unregisterContext).toHaveBeenCalledWith('Sprints');
  });

  it('should clear filters on init', () => {
    expect(mockSprintStore.clearFilters).toHaveBeenCalled();
  });

  it('should apply filters when search changes', fakeAsync(() => {
    component.searchControl.setValue('test');
    tick(350);
    expect(mockSprintStore.setFilters).toHaveBeenCalled();
  }));

  it('should apply filters when status filter changes', () => {
    component.statusFilter.setValue([SprintStatus.Active]);
    expect(mockSprintStore.setFilters).toHaveBeenCalled();
  });

  it('should handle page change', () => {
    component.onPageChange({ pageIndex: 1, pageSize: 20, length: 100 });
    expect(mockSprintStore.setPage).toHaveBeenCalledWith(2);
    expect(mockSprintStore.setPageSize).toHaveBeenCalledWith(20);
  });

  it('should remove individual filter', () => {
    component.statusFilter.setValue([SprintStatus.Active, SprintStatus.Planning]);
    component.removeFilter({ field: 'status', value: SprintStatus.Active });
    expect(component.statusFilter.value).toEqual([SprintStatus.Planning]);
  });

  it('should clear all filters', () => {
    component.searchControl.setValue('test');
    component.statusFilter.setValue([SprintStatus.Active]);
    component.clearAllFilters();
    expect(component.searchControl.value).toBe('');
    expect(component.statusFilter.value).toEqual([]);
  });

  it('should format date correctly', () => {
    const formatted = component.formatDate('2024-01-15T12:00:00Z');
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('2024');
  });

  it('should return correct status class', () => {
    expect(component.getStatusClass(SprintStatus.Active)).toBe('status-active');
    expect(component.getStatusClass(SprintStatus.Planning)).toBe('status-planning');
    expect(component.getStatusClass(SprintStatus.Completed)).toBe('status-completed');
    expect(component.getStatusClass(SprintStatus.Cancelled)).toBe('status-cancelled');
  });
});
