import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';

import { PageBoardComponent } from './page-board.component';
import { SprintStore, WorkItemStore, WebSocketService } from '@ttrpg-ui/features/sprint-management/data-access';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { SprintStatus } = SprintModels.Sprint;
const { WorkItemStatus } = SprintModels.WorkItem;

describe('PageBoardComponent', () => {
  let component: PageBoardComponent;
  let fixture: ComponentFixture<PageBoardComponent>;
  let mockSprintStore: any;
  let mockWorkItemStore: any;
  let mockWsService: any;
  let mockAuthService: any;

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

  const mockWorkItem = {
    id: 'work-item-1',
    title: 'Test Work Item',
    status: WorkItemStatus.Todo,
    sprint_id: 'sprint-1',
    project_id: 'project-1',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };

  beforeEach(async () => {
    mockSprintStore = {
      loadSprints: vi.fn(),
      clearFilters: vi.fn(),
      entities: signal([mockSprint]),
      entityMap: signal({ 'sprint-1': mockSprint }),
      loading: signal(false),
      error: signal(null),
    };

    mockWorkItemStore = {
      loadWorkItems: vi.fn(),
      update: vi.fn(),
      handleWorkItemCreated: vi.fn(),
      handleWorkItemUpdated: vi.fn(),
      handleWorkItemDeleted: vi.fn(),
      entities: signal([mockWorkItem]),
      loading: signal(false),
      error: signal(null),
      errorSummary: signal(null),
    };

    mockWsService = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      joinRoom: vi.fn(),
      leaveRoom: vi.fn(),
      getMessagesByType: vi.fn().mockReturnValue({ subscribe: vi.fn() }),
    };

    mockAuthService = {
      getUserTokenDecoded: () => signal(null),
    };

    await TestBed.configureTestingModule({
      imports: [PageBoardComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SprintStore, useValue: mockSprintStore },
        { provide: WorkItemStore, useValue: mockWorkItemStore },
        { provide: WebSocketService, useValue: mockWsService },
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: SharedCoreService,
          useValue: { appTitle: 'Test App' },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load active sprints on init', () => {
    expect(mockSprintStore.loadSprints).toHaveBeenCalled();
  });

  it('should auto-select active sprint', () => {
    expect(component.selectedSprintId()).toBe('sprint-1');
  });

  it('should load work items for selected sprint', () => {
    component.selectedSprintId.set('sprint-1');
    fixture.detectChanges();
    expect(mockWorkItemStore.loadWorkItems).toHaveBeenCalled();
  });

  it('should handle work item status change', () => {
    component.onWorkItemStatusChanged({
      id: 'work-item-1',
      status: WorkItemStatus.InProgress,
    });
    expect(mockWorkItemStore.update).toHaveBeenCalledWith({
      id: 'work-item-1',
      status: WorkItemStatus.InProgress,
    });
  });
});
