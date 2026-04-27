import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { PageWorkItemDetailComponent } from './page-work-item-detail.component';
import {
  WorkItemStore,
  CommentStore,
  DependencyStore,
  AuditLogStore,
  WorkItemLinkStore,
} from '@ttrpg-ui/features/sprint-management/data-access';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { WorkItemType, WorkItemStatus, WorkItemPriority } = SprintModels.WorkItem;

describe('PageWorkItemDetailComponent', () => {
  let component: PageWorkItemDetailComponent;
  let fixture: ComponentFixture<PageWorkItemDetailComponent>;
  let mockRouter: any;
  let mockActivatedRoute: any;
  let mockWorkItemStore: any;
  let mockCommentStore: any;
  let mockDependencyStore: any;
  let mockAuditLogStore: any;
  let mockAuthService: any;

  const mockWorkItem = {
    id: '1',
    title: 'Test Work Item',
    description: 'Test description',
    type: WorkItemType.Story,
    status: WorkItemStatus.Todo,
    priority: WorkItemPriority.Medium,
    assignee_id: 'user1',
    sprint_id: 'sprint1',
    parent_id: null,
    story_points: 5,
    estimated_hours: 8,
    actual_hours: 0,
    tags: ['test', 'feature'],
    custom_fields: { customField1: 'value1' },
    created_by: 'user1',
    created_at: '2024-01-01T00:00:00Z',
    updated_by: 'user1',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    const noopSubscribable = { pipe: vi.fn(), subscribe: vi.fn() };
    noopSubscribable.pipe.mockReturnValue(noopSubscribable);

    mockRouter = {
      navigate: vi.fn(),
      createUrlTree: vi.fn().mockReturnValue({}),
      serializeUrl: vi.fn().mockReturnValue(''),
      events: noopSubscribable,
    };

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockReturnValue('1'),
        },
      },
    };

    mockWorkItemStore = {
      loading: signal(false),
      error: signal(null),
      entityMap: signal({ '1': mockWorkItem }),
      loadWorkItem: vi.fn(),
      delete: vi.fn(),
    };

    mockCommentStore = {
      loading: signal(false),
      error: signal(null),
      entities: signal([]),
      loadComments: vi.fn(),
    };

    mockDependencyStore = {
      loading: signal(false),
      error: signal(null),
      entities: signal([]),
      loadDependencies: vi.fn(),
    };

    mockAuditLogStore = {
      loading: signal(false),
      error: signal(null),
      filteredLogs: signal([]),
      loadAuditLogs: vi.fn(),
    };

    const mockWorkItemLinkStore = {
      loading: signal(false),
      error: signal(null),
      entities: signal([]),
      linksByType: signal({}),
      loadLinks: vi.fn(),
      createLink: vi.fn(),
      deleteLink: vi.fn(),
    };

    mockAuthService = {
      isLoggedIn: signal(true),
      getUserTokenDecoded: () => signal(null),
    };

    await TestBed.configureTestingModule({
      imports: [PageWorkItemDetailComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: WorkItemStore, useValue: mockWorkItemStore },
        { provide: CommentStore, useValue: mockCommentStore },
        { provide: DependencyStore, useValue: mockDependencyStore },
        { provide: AuditLogStore, useValue: mockAuditLogStore },
        { provide: WorkItemLinkStore, useValue: mockWorkItemLinkStore },
        { provide: AuthService, useValue: mockAuthService },
        { provide: SharedCoreService, useValue: { appTitle: 'Test App' } },
        { provide: Title, useValue: { setTitle: vi.fn() } },
        { provide: Meta, useValue: { updateTag: vi.fn() } },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: MatDialog, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageWorkItemDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load work item data on init', () => {
    fixture.detectChanges();

    expect(component.workItemId()).toBe('1');
    expect(mockWorkItemStore.loadWorkItem).toHaveBeenCalledWith('1');
    // Comments, dependencies, and history are lazy-loaded on tab change
  });

  it('should navigate to edit page when edit button is clicked', () => {
    fixture.detectChanges();
    component.onEditClicked();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/work-items', '1', 'edit']);
  });

  it('should navigate back to list when back button is clicked', () => {
    fixture.detectChanges();
    component.onBackClicked();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/work-items']);
  });

  it('should compute work item from store', () => {
    fixture.detectChanges();

    const workItem = component.workItem();
    expect(workItem).toEqual(mockWorkItem);
  });

  it('should compute loading state from all stores', () => {
    fixture.detectChanges();

    expect(component.loading()).toBe(false);

    mockWorkItemStore.loading.set(true);
    expect(component.loading()).toBe(true);
  });

  it('should format dates correctly', () => {
    const dateString = '2024-01-01T12:00:00Z';
    const formatted = component.formatDate(dateString);

    expect(formatted).toContain('2024');
    expect(formatted).toContain('1');
  });

  it('should get correct status color', () => {
    expect(component.getStatusColor(WorkItemStatus.Done)).toBe('primary');
    expect(component.getStatusColor(WorkItemStatus.InProgress)).toBe('accent');
    expect(component.getStatusColor(WorkItemStatus.InReview)).toBe('warn');
  });

  it('should get correct priority color', () => {
    expect(component.getPriorityColor(WorkItemPriority.Critical)).toBe('warn');
    expect(component.getPriorityColor(WorkItemPriority.High)).toBe('accent');
  });

  it('should get correct type icon', () => {
    expect(component.getTypeIcon(WorkItemType.Story)).toBe('book');
    expect(component.getTypeIcon(WorkItemType.Defect)).toBe('bug_report');
    expect(component.getTypeIcon(WorkItemType.Epic)).toBe('flag');
  });
});
