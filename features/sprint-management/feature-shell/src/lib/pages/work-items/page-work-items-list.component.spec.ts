import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';

import { PageWorkItemsListComponent } from './page-work-items-list.component';
import { WorkItemStore } from '@ttrpg-ui/features/sprint-management/data-access';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { SHARED_CORE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/core/models';

const SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN = SprintModels.Service.SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN;
const { WorkItemType, WorkItemStatus, WorkItemPriority } = SprintModels.WorkItem;
type WorkItem = SprintModels.WorkItem.WorkItem;

describe('PageWorkItemsListComponent - Integration Tests', () => {
  let component: PageWorkItemsListComponent;
  let fixture: ComponentFixture<PageWorkItemsListComponent>;
  let workItemStore: WorkItemStore;

  const mockWorkItems: WorkItem[] = [
    {
      id: '1',
      title: 'Test Work Item 1',
      description: 'Description 1',
      type: WorkItemType.Story,
      status: WorkItemStatus.Todo,
      priority: WorkItemPriority.High,
      assignee_id: null,
      sprint_id: null,
      parent_id: null,
      project_id: null,
      ticket_number: null,
      story_points: 3,
      estimated_hours: null,
      actual_hours: null,
      tags: [],
      custom_fields: {},
      created_by: 'user1',
      created_at: '2024-01-01T00:00:00Z',
      updated_by: 'user1',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Test Work Item 2',
      description: 'Description 2',
      type: WorkItemType.Defect,
      status: WorkItemStatus.InProgress,
      priority: WorkItemPriority.Critical,
      assignee_id: null,
      sprint_id: null,
      parent_id: null,
      project_id: null,
      ticket_number: null,
      story_points: 5,
      estimated_hours: null,
      actual_hours: null,
      tags: [],
      custom_fields: {},
      created_by: 'user1',
      created_at: '2024-01-02T00:00:00Z',
      updated_by: 'user1',
      updated_at: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageWorkItemsListComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: SHARED_CORE_SERVICE_CONFIG_TOKEN,
          useValue: {
            appTitle: 'Test App',
          },
        },
        {
          provide: SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN,
          useValue: {
            appConfig: signal({
              APP_SPRINT_MANAGEMENT__API_BASE_PATH: '/api',
              APP_SPRINT_MANAGEMENT__API_URL: 'http://localhost:8003',
            }),
            initialized: signal(true),
          },
        },
        {
          provide: SharedLocalStorageService,
          useValue: {
            get: vi.fn().mockReturnValue(null),
            set: vi.fn(),
            remove: vi.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            getUserTokenDecoded: vi.fn().mockReturnValue(signal(null)),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageWorkItemsListComponent);
    component = fixture.componentInstance;
    workItemStore = TestBed.inject(WorkItemStore);
  });

  describe('Loading Work Items', () => {
    it('should load work items on initialization', () => {
      // Spy on the store's loadWorkItems method
      const loadSpy = vi.spyOn(workItemStore, 'loadWorkItems');

      // Trigger ngOnInit
      fixture.detectChanges();

      // Verify loadWorkItems was called
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should display work items when loaded', () => {
      // Mock the store entities
      vi.spyOn(workItemStore, 'entities').mockReturnValue(mockWorkItems);
      vi.spyOn(workItemStore, 'loading').mockReturnValue(false);
      vi.spyOn(workItemStore, 'error').mockReturnValue(null);

      fixture.detectChanges();

      // Check that work items are displayed (in card view by default)
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Test Work Item 1');
      expect(compiled.textContent).toContain('Test Work Item 2');
    });

    it('should display loading indicator when loading', () => {
      vi.spyOn(workItemStore, 'loading').mockReturnValue(true);
      vi.spyOn(workItemStore, 'entities').mockReturnValue([]);

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const spinner = compiled.querySelector('mat-spinner');
      expect(spinner).toBeTruthy();
    });

    it('should display error message when loading fails', () => {
      vi.spyOn(workItemStore, 'loading').mockReturnValue(false);
      vi.spyOn(workItemStore, 'error').mockReturnValue('Network error');
      vi.spyOn(workItemStore, 'errorSummary').mockReturnValue(
        'Failed to load work items'
      );
      vi.spyOn(workItemStore, 'entities').mockReturnValue([]);

      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Error Loading Work Items');
      expect(compiled.textContent).toContain('Failed to load work items');
    });
  });

  describe('Filtering and Sorting', () => {
    beforeEach(() => {
      vi.spyOn(workItemStore, 'entities').mockReturnValue(mockWorkItems);
      vi.spyOn(workItemStore, 'loading').mockReturnValue(false);
      vi.spyOn(workItemStore, 'error').mockReturnValue(null);
      fixture.detectChanges();
    });

    it('should apply type filter when selected', () => {
      const setFiltersSpy = vi.spyOn(workItemStore, 'setFilters');

      // Select a type filter
      component.typeFilter.setValue([WorkItemType.Story]);

      // Verify setFilters was called with correct filter
      expect(setFiltersSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.arrayContaining([
            expect.objectContaining({
              field: 'type',
              value: [WorkItemType.Story],
            }),
          ]),
        })
      );
    });

    it('should apply status filter when selected', () => {
      const setFiltersSpy = vi.spyOn(workItemStore, 'setFilters');

      // Select a status filter
      component.statusFilter.setValue([WorkItemStatus.InProgress]);

      // Verify setFilters was called with correct filter
      expect(setFiltersSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.arrayContaining([
            expect.objectContaining({
              field: 'status',
              value: [WorkItemStatus.InProgress],
            }),
          ]),
        })
      );
    });

    it('should apply priority filter when selected', () => {
      const setFiltersSpy = vi.spyOn(workItemStore, 'setFilters');

      // Select a priority filter
      component.priorityFilter.setValue([WorkItemPriority.High]);

      // Verify setFilters was called with correct filter
      expect(setFiltersSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.arrayContaining([
            expect.objectContaining({
              field: 'priority',
              value: [WorkItemPriority.High],
            }),
          ]),
        })
      );
    });

    it('should apply search filter with debounce', async () => {
      const setFiltersSpy = vi.spyOn(workItemStore, 'setFilters');

      // Set search value
      component.searchControl.setValue('test query');

      // Wait for debounce (300ms)
      await new Promise((resolve) => setTimeout(resolve, 350));

      // Verify setFilters was called with search filter
      expect(setFiltersSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.arrayContaining([
            expect.objectContaining({
              field: 'search',
              value: 'test query',
            }),
          ]),
        })
      );
    });

    it('should clear all filters when clearAllFilters is called', () => {
      const setFiltersSpy = vi.spyOn(workItemStore, 'setFilters');

      // Set some filters
      component.typeFilter.setValue([WorkItemType.Story]);
      component.statusFilter.setValue([WorkItemStatus.Todo]);
      component.searchControl.setValue('test');

      // Clear all filters
      component.clearAllFilters();

      // Verify all filters are cleared
      expect(component.searchControl.value).toBe('');
      expect(component.typeFilter.value).toEqual([]);
      expect(component.statusFilter.value).toEqual([]);
      expect(setFiltersSpy).toHaveBeenCalledWith({
        filters: [],
        operator: 'AND',
      });
    });

    it('should clear sorting when clearAllSorting is called', () => {
      const setSortsSpy = vi.spyOn(workItemStore, 'setSorts');

      component.clearAllSorting();

      expect(setSortsSpy).toHaveBeenCalledWith({ sorts: [] });
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      vi.spyOn(workItemStore, 'entities').mockReturnValue(mockWorkItems);
      vi.spyOn(workItemStore, 'loading').mockReturnValue(false);
      vi.spyOn(workItemStore, 'error').mockReturnValue(null);
      vi.spyOn(workItemStore, 'pagination').mockReturnValue({
        currentPage: 1,
        pageSize: 25,
        totalItems: 100,
        totalPages: 4,
      });
      fixture.detectChanges();
    });

    it('should change page when pagination event is triggered', () => {
      const setPageSpy = vi.spyOn(workItemStore, 'setPage');
      const setPageSizeSpy = vi.spyOn(workItemStore, 'setPageSize');

      // Simulate page change event
      component.onPageChange({
        pageIndex: 2,
        pageSize: 25,
        length: 100,
      });

      // Verify page was updated (pageIndex is 0-based, but store uses 1-based)
      expect(setPageSpy).toHaveBeenCalledWith(3);
      expect(setPageSizeSpy).toHaveBeenCalledWith(25);
    });

    it('should change page size when pagination event is triggered', () => {
      const setPageSpy = vi.spyOn(workItemStore, 'setPage');
      const setPageSizeSpy = vi.spyOn(workItemStore, 'setPageSize');

      // Simulate page size change event
      component.onPageChange({
        pageIndex: 0,
        pageSize: 50,
        length: 100,
      });

      // Verify page size was updated
      expect(setPageSpy).toHaveBeenCalledWith(1);
      expect(setPageSizeSpy).toHaveBeenCalledWith(50);
    });
  });

  describe('View Mode Toggle', () => {
    it('should toggle between card and table view', () => {
      fixture.detectChanges();

      // Default should be table view
      expect(component.currentView()).toBe('table');

      // Switch to card view
      component.currentView.set('card');
      fixture.detectChanges();

      expect(component.currentView()).toBe('card');

      // Switch back to table view
      component.currentView.set('table');
      fixture.detectChanges();

      expect(component.currentView()).toBe('table');
    });
  });

  describe('Bulk Selection', () => {
    beforeEach(() => {
      vi.spyOn(workItemStore, 'entities').mockReturnValue(mockWorkItems);
      vi.spyOn(workItemStore, 'loading').mockReturnValue(false);
      vi.spyOn(workItemStore, 'error').mockReturnValue(null);
      fixture.detectChanges();
    });

    it('should select individual work item', () => {
      component.toggleSelectItem('1');

      expect(component.isSelected('1')).toBe(true);
      expect(component.selectionCount()).toBe(1);
    });

    it('should deselect individual work item', () => {
      component.toggleSelectItem('1');
      expect(component.isSelected('1')).toBe(true);

      component.toggleSelectItem('1');
      expect(component.isSelected('1')).toBe(false);
      expect(component.selectionCount()).toBe(0);
    });

    it('should select all work items', () => {
      component.toggleSelectAll();

      expect(component.selectionCount()).toBe(2);
      expect(component.isSelected('1')).toBe(true);
      expect(component.isSelected('2')).toBe(true);
      expect(component.selectAllChecked()).toBe(true);
    });

    it('should deselect all work items', () => {
      component.toggleSelectAll();
      expect(component.selectionCount()).toBe(2);

      component.toggleSelectAll();
      expect(component.selectionCount()).toBe(0);
      expect(component.selectAllChecked()).toBe(false);
    });

    it('should clear selection', () => {
      component.toggleSelectItem('1');
      component.toggleSelectItem('2');
      expect(component.selectionCount()).toBe(2);

      component.clearSelection();
      expect(component.selectionCount()).toBe(0);
      expect(component.selectAllChecked()).toBe(false);
    });
  });
});
