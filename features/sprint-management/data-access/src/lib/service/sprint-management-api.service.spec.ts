import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';

import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN = SprintModels.Service.SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN;
const { WorkItemType, WorkItemStatus, WorkItemPriority } = SprintModels.WorkItem;
const { SprintStatus } = SprintModels.Sprint;
const { DependencyType } = SprintModels.Dependency;
const { FilterType, FilterCondition } = SprintModels.Filter;
const { SortDirection } = SprintModels.Sort;
import { SprintManagementApiService } from './sprint-management-api.service';

describe('SprintManagementApiService', () => {
  let service: SprintManagementApiService;
  let httpMock: HttpTestingController;
  const baseUrl = '/sprint-management-api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN,
          useValue: {
            appConfig: signal({
              APP_SPRINT_MANAGEMENT__API_BASE_PATH: baseUrl,
              APP_SPRINT_MANAGEMENT__API_URL: 'http://localhost:8003',
            }),
            initialized: signal(true),
          },
        },
      ],
    });
    service = TestBed.inject(SprintManagementApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ============================================================================
  // Work Items Tests
  // ============================================================================

  describe('Work Items', () => {
    it('should get paginated work items', () => {
      const mockResponse = {
        items: [
          {
            id: '1',
            title: 'Test Work Item',
            description: 'Test description',
            type: WorkItemType.Story,
            status: WorkItemStatus.Todo,
            priority: WorkItemPriority.Medium,
            assignee_id: null,
            sprint_id: null,
            parent_id: null,
            story_points: null,
            estimated_hours: null,
            actual_hours: null,
            tags: [],
            custom_fields: {},
            created_by: 'user1',
            created_at: '2024-01-01T00:00:00Z',
            updated_by: 'user1',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        page_size: 25,
        total_pages: 1,
      };

      service.getWorkItems({ page: 1, page_size: 25 }).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.items.length).toBe(1);
        expect(response.items[0].title).toBe('Test Work Item');
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems?page=1&page_size=25`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should get work items with filters and sorting', () => {
      const request = {
        page: 1,
        page_size: 25,
        filters: [
          {
            field: 'status',
            type: FilterType.Set,
            condition: FilterCondition.Equals,
            value: [WorkItemStatus.InProgress],
          },
        ],
        sort: [
          {
            field: 'priority',
            direction: SortDirection.Desc,
            priority: 1,
          },
        ],
      };

      service.getWorkItems(request).subscribe();

      const req = httpMock.expectOne((req) => req.url === `${baseUrl}/workitems`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('page_size')).toBe('25');
      expect(req.request.params.get('filters')).toBeTruthy();
      expect(req.request.params.get('sort')).toBeTruthy();
      req.flush({ items: [], total: 0, page: 1, page_size: 25, total_pages: 0 });
    });

    it('should get a single work item by ID', () => {
      const mockWorkItem = {
        id: '1',
        title: 'Test Work Item',
        description: 'Test description',
        type: WorkItemType.Story,
        status: WorkItemStatus.Todo,
        priority: WorkItemPriority.Medium,
        assignee_id: null,
        sprint_id: null,
        parent_id: null,
        story_points: null,
        estimated_hours: null,
        actual_hours: null,
        tags: [],
        custom_fields: {},
        created_by: 'user1',
        created_at: '2024-01-01T00:00:00Z',
        updated_by: 'user1',
        updated_at: '2024-01-01T00:00:00Z',
      };

      service.getWorkItem('1').subscribe((workItem) => {
        expect(workItem).toEqual(mockWorkItem);
        expect(workItem.id).toBe('1');
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockWorkItem);
    });

    it('should create a work item', () => {
      const createRequest = {
        title: 'New Work Item',
        description: 'New description',
        type: WorkItemType.Story,
        status: WorkItemStatus.Backlog,
        priority: WorkItemPriority.High,
      };

      const mockResponse = {
        id: '2',
        ...createRequest,
        assignee_id: null,
        sprint_id: null,
        parent_id: null,
        story_points: null,
        estimated_hours: null,
        actual_hours: null,
        tags: [],
        custom_fields: {},
        created_by: 'user1',
        created_at: '2024-01-01T00:00:00Z',
        updated_by: 'user1',
        updated_at: '2024-01-01T00:00:00Z',
      };

      service.createWorkItem(createRequest).subscribe((workItem) => {
        expect(workItem.id).toBe('2');
        expect(workItem.title).toBe('New Work Item');
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockResponse);
    });

    it('should update a work item', () => {
      const updateRequest = {
        id: '1',
        title: 'Updated Work Item',
        status: WorkItemStatus.InProgress,
      };

      const mockResponse = {
        id: '1',
        title: 'Updated Work Item',
        description: 'Test description',
        type: WorkItemType.Story,
        status: WorkItemStatus.InProgress,
        priority: WorkItemPriority.Medium,
        assignee_id: null,
        sprint_id: null,
        parent_id: null,
        story_points: null,
        estimated_hours: null,
        actual_hours: null,
        tags: [],
        custom_fields: {},
        created_by: 'user1',
        created_at: '2024-01-01T00:00:00Z',
        updated_by: 'user1',
        updated_at: '2024-01-01T00:00:00Z',
      };

      service.updateWorkItem('1', updateRequest).subscribe((workItem) => {
        expect(workItem.title).toBe('Updated Work Item');
        expect(workItem.status).toBe(WorkItemStatus.InProgress);
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockResponse);
    });

    it('should delete a work item', () => {
      service.deleteWorkItem('1').subscribe();

      const req = httpMock.expectOne(`${baseUrl}/workitems/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should bulk update work items', () => {
      const bulkRequest = {
        work_item_ids: ['1', '2', '3'],
        updates: {
          status: WorkItemStatus.Done,
          priority: WorkItemPriority.Low,
        },
      };

      const mockResponse = [
        { id: '1', status: WorkItemStatus.Done, priority: WorkItemPriority.Low },
        { id: '2', status: WorkItemStatus.Done, priority: WorkItemPriority.Low },
        { id: '3', status: WorkItemStatus.Done, priority: WorkItemPriority.Low },
      ];

      service.bulkUpdateWorkItems(bulkRequest).subscribe((workItems) => {
        expect(workItems.length).toBe(3);
        expect(workItems[0].status).toBe(WorkItemStatus.Done);
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems/bulk-update`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(bulkRequest);
      req.flush(mockResponse);
    });

    it('should search work items', () => {
      const searchRequest = {
        query: 'test',
        search_fields: ['title', 'description'],
        page: 1,
        page_size: 25,
      };

      const mockResponse = {
        items: [],
        total: 0,
        page: 1,
        page_size: 25,
        total_pages: 0,
      };

      service.searchWorkItems(searchRequest).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems/search`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(searchRequest);
      req.flush(mockResponse);
    });

    it('should handle work item API errors', () => {
      service.getWorkItem('999').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems/999`);
      req.flush('Work item not found', { status: 404, statusText: 'Not Found' });
    });
  });

  // ============================================================================
  // Sprints Tests
  // ============================================================================

  describe('Sprints', () => {
    it('should get paginated sprints', () => {
      const mockResponse = {
        items: [
          {
            id: '1',
            name: 'Sprint 1',
            description: 'First sprint',
            start_date: '2024-01-01',
            end_date: '2024-01-14',
            status: SprintStatus.Active,
            goal: 'Complete features',
            created_by: 'user1',
            created_at: '2024-01-01T00:00:00Z',
            updated_by: 'user1',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        page_size: 25,
        total_pages: 1,
      };

      service.getSprints({ page: 1, page_size: 25 }).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(response.items.length).toBe(1);
        expect(response.items[0].name).toBe('Sprint 1');
      });

      const req = httpMock.expectOne(`${baseUrl}/sprints?page=1&page_size=25`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should get a single sprint by ID', () => {
      const mockSprint = {
        id: '1',
        name: 'Sprint 1',
        description: 'First sprint',
        start_date: '2024-01-01',
        end_date: '2024-01-14',
        status: SprintStatus.Active,
        goal: 'Complete features',
        created_by: 'user1',
        created_at: '2024-01-01T00:00:00Z',
        updated_by: 'user1',
        updated_at: '2024-01-01T00:00:00Z',
      };

      service.getSprint('1').subscribe((sprint) => {
        expect(sprint).toEqual(mockSprint);
        expect(sprint.id).toBe('1');
      });

      const req = httpMock.expectOne(`${baseUrl}/sprints/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSprint);
    });

    it('should create a sprint', () => {
      const createRequest = {
        name: 'New Sprint',
        description: 'New sprint description',
        start_date: '2024-02-01',
        end_date: '2024-02-14',
        goal: 'New goals',
      };

      const mockResponse = {
        id: '2',
        ...createRequest,
        status: SprintStatus.Planning,
        created_by: 'user1',
        created_at: '2024-01-01T00:00:00Z',
        updated_by: 'user1',
        updated_at: '2024-01-01T00:00:00Z',
      };

      service.createSprint(createRequest).subscribe((sprint) => {
        expect(sprint.id).toBe('2');
        expect(sprint.name).toBe('New Sprint');
      });

      const req = httpMock.expectOne(`${baseUrl}/sprints`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush(mockResponse);
    });

    it('should update a sprint', () => {
      const updateRequest = {
        id: '1',
        name: 'Updated Sprint',
        status: SprintStatus.Completed,
      };

      const mockResponse = {
        id: '1',
        name: 'Updated Sprint',
        description: 'First sprint',
        start_date: '2024-01-01',
        end_date: '2024-01-14',
        status: SprintStatus.Completed,
        goal: 'Complete features',
        created_by: 'user1',
        created_at: '2024-01-01T00:00:00Z',
        updated_by: 'user1',
        updated_at: '2024-01-01T00:00:00Z',
      };

      service.updateSprint('1', updateRequest).subscribe((sprint) => {
        expect(sprint.name).toBe('Updated Sprint');
        expect(sprint.status).toBe(SprintStatus.Completed);
      });

      const req = httpMock.expectOne(`${baseUrl}/sprints/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush(mockResponse);
    });

    it('should delete a sprint', () => {
      service.deleteSprint('1').subscribe();

      const req = httpMock.expectOne(`${baseUrl}/sprints/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should start a sprint', () => {
      const mockResponse = {
        id: '1',
        name: 'Sprint 1',
        description: 'First sprint',
        start_date: '2024-01-01',
        end_date: '2024-01-14',
        status: SprintStatus.Active,
        goal: 'Complete features',
        created_by: 'user1',
        created_at: '2024-01-01T00:00:00Z',
        updated_by: 'user1',
        updated_at: '2024-01-01T00:00:00Z',
      };

      service.startSprint('1').subscribe((sprint) => {
        expect(sprint.status).toBe(SprintStatus.Active);
      });

      const req = httpMock.expectOne(`${baseUrl}/sprints/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });

    it('should complete a sprint', () => {
      const mockResponse = {
        id: '1',
        name: 'Sprint 1',
        description: 'First sprint',
        start_date: '2024-01-01',
        end_date: '2024-01-14',
        status: SprintStatus.Completed,
        goal: 'Complete features',
        created_by: 'user1',
        created_at: '2024-01-01T00:00:00Z',
        updated_by: 'user1',
        updated_at: '2024-01-01T00:00:00Z',
      };

      service.completeSprint('1').subscribe((sprint) => {
        expect(sprint.status).toBe(SprintStatus.Completed);
      });

      const req = httpMock.expectOne(`${baseUrl}/sprints/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);
    });

    it('should handle sprint API errors', () => {
      service.getSprint('999').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/sprints/999`);
      req.flush('Sprint not found', { status: 404, statusText: 'Not Found' });
    });
  });

  // ============================================================================
  // Dependencies Tests
  // ============================================================================

  describe('Dependencies', () => {
    it('should get dependencies for a work item', () => {
      const mockDependencies = [
        {
          id: '1',
          source_work_item_id: '1',
          target_work_item_id: '2',
          dependency_type: DependencyType.Blocks,
          created_by: 'user1',
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      service.getDependencies('1').subscribe((dependencies) => {
        expect(dependencies).toEqual(mockDependencies);
        expect(dependencies.length).toBe(1);
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems/1/dependencies`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDependencies);
    });

    it('should create a dependency', () => {
      const mockDependency = {
        id: '2',
        source_work_item_id: '1',
        target_work_item_id: '3',
        dependency_type: DependencyType.BlockedBy,
        created_by: 'user1',
        created_at: '2024-01-01T00:00:00Z',
      };

      service.createDependency('1', '3', DependencyType.BlockedBy).subscribe((dependency) => {
        expect(dependency).toEqual(mockDependency);
        expect(dependency.dependency_type).toBe(DependencyType.BlockedBy);
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems/1/dependencies`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        target_work_item_id: '3',
        dependency_type: DependencyType.BlockedBy,
      });
      req.flush(mockDependency);
    });

    it('should delete a dependency', () => {
      service.deleteDependency('1', '2').subscribe();

      const req = httpMock.expectOne(`${baseUrl}/workitems/1/dependencies/2`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle dependency API errors', () => {
      service.getDependencies('999').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems/999/dependencies`);
      req.flush('Work item not found', { status: 404, statusText: 'Not Found' });
    });
  });

  // ============================================================================
  // Comments Tests
  // ============================================================================

  describe('Comments', () => {
    it('should get comments for a work item', () => {
      const mockComments = [
        {
          id: '1',
          work_item_id: '1',
          content: 'Test comment',
          author_id: 'user1',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      service.getComments('1').subscribe((comments) => {
        expect(comments).toEqual(mockComments);
        expect(comments.length).toBe(1);
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems/1/comments`);
      expect(req.request.method).toBe('GET');
      req.flush(mockComments);
    });

    it('should create a comment', () => {
      const mockComment = {
        id: '2',
        work_item_id: '1',
        content: 'New comment',
        author_id: 'user1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      service.createComment('1', 'New comment').subscribe((comment) => {
        expect(comment).toEqual(mockComment);
        expect(comment.content).toBe('New comment');
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems/1/comments`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ content: 'New comment' });
      req.flush(mockComment);
    });

    it('should update a comment', () => {
      const mockComment = {
        id: '1',
        work_item_id: '1',
        content: 'Updated comment',
        author_id: 'user1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      service.updateComment('1', '1', 'Updated comment').subscribe((comment) => {
        expect(comment.content).toBe('Updated comment');
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems/1/comments/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ content: 'Updated comment' });
      req.flush(mockComment);
    });

    it('should delete a comment', () => {
      service.deleteComment('1', '1').subscribe();

      const req = httpMock.expectOne(`${baseUrl}/workitems/1/comments/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle comment API errors', () => {
      service.getComments('999').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems/999/comments`);
      req.flush('Work item not found', { status: 404, statusText: 'Not Found' });
    });
  });

  // ============================================================================
  // Tags Tests
  // ============================================================================

  describe('Tags', () => {
    const mockWorkItem = {
      id: '1',
      title: 'Test Work Item',
      description: 'Test description',
      type: WorkItemType.Story,
      status: WorkItemStatus.Todo,
      priority: WorkItemPriority.Medium,
      assignee_id: null,
      sprint_id: null,
      parent_id: null,
      project_id: null,
      ticket_number: null,
      story_points: null,
      estimated_hours: null,
      actual_hours: null,
      tags: ['bug', 'frontend'],
      custom_fields: {},
      created_by: 'user1',
      created_at: '2024-01-01T00:00:00Z',
      updated_by: 'user1',
      updated_at: '2024-01-01T00:00:00Z',
    };

    it('should add a tag to a work item', () => {
      service.addTag('1', 'new-tag').subscribe((workItem) => {
        expect(workItem.tags).toContain('new-tag');
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems/1/tags`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ tag: 'new-tag' });
      req.flush({ ...mockWorkItem, tags: ['bug', 'frontend', 'new-tag'] });
    });

    it('should remove a tag from a work item', () => {
      service.removeTag('1', 'bug').subscribe((workItem) => {
        expect(workItem.tags).not.toContain('bug');
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems/1/tags/bug`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ ...mockWorkItem, tags: ['frontend'] });
    });

    it('should URL-encode tag names when removing', () => {
      service.removeTag('1', 'my tag').subscribe();

      const req = httpMock.expectOne(`${baseUrl}/workitems/1/tags/my%20tag`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ ...mockWorkItem, tags: [] });
    });

    it('should get tags for a work item', () => {
      service.getTags('1').subscribe((tags) => {
        expect(tags).toEqual(['bug', 'frontend']);
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems/1/tags`);
      expect(req.request.method).toBe('GET');
      req.flush(['bug', 'frontend']);
    });

    it('should handle tag API errors', () => {
      service.addTag('999', 'tag').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems/999/tags`);
      req.flush('Work item not found', { status: 404, statusText: 'Not Found' });
    });
  });

  // ============================================================================
  // Export Tests
  // ============================================================================

  describe('Export', () => {
    it('should export work items to CSV', () => {
      const mockBlob = new Blob(['csv data'], { type: 'text/csv' });

      service.exportWorkItems('csv', { page: 1, page_size: 100 }).subscribe((blob) => {
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.type).toBe('text/csv');
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems/export/csv?page=1&page_size=100`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });

    it('should export work items to JSON', () => {
      const mockBlob = new Blob(['json data'], { type: 'application/json' });

      service.exportWorkItems('json', { page: 1, page_size: 100 }).subscribe((blob) => {
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.type).toBe('application/json');
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems/export/json?page=1&page_size=100`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });

    it('should export work items with filters and sorting', () => {
      const request = {
        page: 1,
        page_size: 100,
        filters: [
          {
            field: 'status',
            type: FilterType.Set,
            condition: FilterCondition.Equals,
            value: [WorkItemStatus.Done],
          },
        ],
        sort: [
          {
            field: 'created_at',
            direction: SortDirection.Desc,
            priority: 1,
          },
        ],
      };

      service.exportWorkItems('csv', request).subscribe();

      const req = httpMock.expectOne((req) => req.url === `${baseUrl}/workitems/export/csv`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('filters')).toBeTruthy();
      expect(req.request.params.get('sort')).toBeTruthy();
      req.flush(new Blob());
    });
  });

  // ============================================================================
  // Time Tracking Tests
  // ============================================================================

  describe('Time Tracking', () => {
    const mockTimeEntry = {
      id: 'te-1',
      work_item_id: '1',
      user_id: 'user1',
      hours: 2.5,
      description: 'Worked on feature',
      date: '2024-01-15',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    };

    it('should get time entries for a work item', () => {
      service.getTimeEntries('1').subscribe((entries) => {
        expect(entries).toEqual([mockTimeEntry]);
        expect(entries.length).toBe(1);
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems/1/time-entries`);
      expect(req.request.method).toBe('GET');
      req.flush([mockTimeEntry]);
    });

    it('should create a time entry', () => {
      const createRequest = {
        work_item_id: '1',
        hours: 3,
        description: 'New work',
        date: '2024-01-16',
      };

      service.createTimeEntry(createRequest).subscribe((entry) => {
        expect(entry.hours).toBe(3);
        expect(entry.work_item_id).toBe('1');
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems/1/time-entries`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createRequest);
      req.flush({ ...mockTimeEntry, id: 'te-2', hours: 3, description: 'New work', date: '2024-01-16' });
    });

    it('should update a time entry', () => {
      const updateRequest = { id: 'te-1', hours: 4, description: 'Updated' };

      service.updateTimeEntry('1', updateRequest).subscribe((entry) => {
        expect(entry.hours).toBe(4);
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems/1/time-entries/te-1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateRequest);
      req.flush({ ...mockTimeEntry, hours: 4, description: 'Updated' });
    });

    it('should delete a time entry', () => {
      service.deleteTimeEntry('1', 'te-1').subscribe();

      const req = httpMock.expectOne(`${baseUrl}/workitems/1/time-entries/te-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should handle time tracking API errors', () => {
      service.getTimeEntries('999').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(`${baseUrl}/workitems/999/time-entries`);
      req.flush('Work item not found', { status: 404, statusText: 'Not Found' });
    });
  });

  // ============================================================================
  // Query Parameter Building Tests
  // ============================================================================

  describe('Query Parameter Building', () => {
    it('should build basic pagination params', () => {
      service.getWorkItems({ page: 2, page_size: 50 }).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/workitems?page=2&page_size=50`);
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('page_size')).toBe('50');
      req.flush({ items: [], total: 0, page: 2, page_size: 50, total_pages: 0 });
    });

    it('should build params with filters', () => {
      const filters = [
        {
          field: 'status',
          type: FilterType.Set,
          condition: FilterCondition.Equals,
          value: [WorkItemStatus.InProgress, WorkItemStatus.InReview],
        },
      ];

      service.getWorkItems({ page: 1, page_size: 25, filters }).subscribe();

      const req = httpMock.expectOne((req) => req.url === `${baseUrl}/workitems`);
      const filtersParam = req.request.params.get('filters');
      expect(filtersParam).toBeTruthy();
      const parsedFilters = JSON.parse(filtersParam!);
      expect(parsedFilters).toEqual(filters);
      req.flush({ items: [], total: 0, page: 1, page_size: 25, total_pages: 0 });
    });

    it('should build params with sorting', () => {
      const sort = [
        {
          field: 'priority',
          direction: SortDirection.Desc,
          priority: 1,
        },
        {
          field: 'created_at',
          direction: SortDirection.Asc,
          priority: 2,
        },
      ];

      service.getWorkItems({ page: 1, page_size: 25, sort }).subscribe();

      const req = httpMock.expectOne((req) => req.url === `${baseUrl}/workitems`);
      const sortParam = req.request.params.get('sort');
      expect(sortParam).toBeTruthy();
      const parsedSort = JSON.parse(sortParam!);
      expect(parsedSort).toEqual(sort);
      req.flush({ items: [], total: 0, page: 1, page_size: 25, total_pages: 0 });
    });

    it('should build params with both filters and sorting', () => {
      const filters = [
        {
          field: 'type',
          type: FilterType.Set,
          condition: FilterCondition.Equals,
          value: [WorkItemType.Defect],
        },
      ];

      const sort = [
        {
          field: 'priority',
          direction: SortDirection.Desc,
          priority: 1,
        },
      ];

      service.getWorkItems({ page: 1, page_size: 25, filters, sort }).subscribe();

      const req = httpMock.expectOne((req) => req.url === `${baseUrl}/workitems`);
      expect(req.request.params.get('filters')).toBeTruthy();
      expect(req.request.params.get('sort')).toBeTruthy();
      req.flush({ items: [], total: 0, page: 1, page_size: 25, total_pages: 0 });
    });
  });

  // ============================================================================
  // Templates Tests
  // ============================================================================

  describe('Templates', () => {
    it('should return an array of WorkItemTemplate objects', () => {
      let result: SprintModels.Template.WorkItemTemplate[] | undefined;
      service.getWorkItemTemplates().subscribe((templates) => {
        result = templates;
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result!.length).toBeGreaterThan(0);
    });

    it('should return templates with required id, name, description, and type fields', () => {
      let result: SprintModels.Template.WorkItemTemplate[] | undefined;
      service.getWorkItemTemplates().subscribe((templates) => {
        result = templates;
      });

      for (const tpl of result!) {
        expect(tpl.id).toBeTruthy();
        expect(tpl.name).toBeTruthy();
        expect(tpl.description).toBeTruthy();
        expect(tpl.type).toBeTruthy();
      }
    });

    it('should include Bug, Feature, and Task templates', () => {
      let result: SprintModels.Template.WorkItemTemplate[] | undefined;
      service.getWorkItemTemplates().subscribe((templates) => {
        result = templates;
      });

      const names = result!.map((t) => t.name);
      expect(names.some((n) => n.toLowerCase().includes('bug'))).toBe(true);
      expect(names.some((n) => n.toLowerCase().includes('feature'))).toBe(true);
      expect(names.some((n) => n.toLowerCase().includes('task'))).toBe(true);
    });

    it('should return templates with defaultPriority set', () => {
      let result: SprintModels.Template.WorkItemTemplate[] | undefined;
      service.getWorkItemTemplates().subscribe((templates) => {
        result = templates;
      });

      const withPriority = result!.filter((t) => t.defaultPriority !== undefined);
      expect(withPriority.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // Custom Fields Tests
  // ============================================================================

  describe('Custom Fields', () => {
    it('should return an array of CustomFieldDefinition objects', () => {
      let result: any[] | undefined;
      service.getCustomFieldDefinitions().subscribe((fields) => {
        result = fields;
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result!.length).toBeGreaterThan(0);
    });

    it('should return definitions covering all field types', () => {
      const { CustomFieldType } = SprintModels.CustomField;
      let result: any[] | undefined;
      service.getCustomFieldDefinitions().subscribe((fields) => {
        result = fields;
      });

      const types = result!.map((f) => f.type);
      expect(types).toContain(CustomFieldType.Text);
      expect(types).toContain(CustomFieldType.Number);
      expect(types).toContain(CustomFieldType.Date);
      expect(types).toContain(CustomFieldType.Select);
      expect(types).toContain(CustomFieldType.MultiSelect);
      expect(types).toContain(CustomFieldType.Checkbox);
    });

    it('should return definitions with required key and label fields', () => {
      let result: any[] | undefined;
      service.getCustomFieldDefinitions().subscribe((fields) => {
        result = fields;
      });

      for (const field of result!) {
        expect(field.key).toBeTruthy();
        expect(field.label).toBeTruthy();
        expect(field.type).toBeTruthy();
      }
    });
  });
});
