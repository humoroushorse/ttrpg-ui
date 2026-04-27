import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { SprintBoardComponent } from './sprint-board.component';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { WorkItemStatus } = SprintModels.WorkItem;
type WorkItem = SprintModels.WorkItem.WorkItem;

describe('SprintBoardComponent', () => {
  let component: SprintBoardComponent;
  let fixture: ComponentFixture<SprintBoardComponent>;

  const mockWorkItems: WorkItem[] = [
    {
      id: '1',
      title: 'Todo Item',
      description: '',
      type: SprintModels.WorkItem.WorkItemType.Story,
      status: WorkItemStatus.Todo,
      priority: SprintModels.WorkItem.WorkItemPriority.Medium,
      sprint_id: 'sprint-1',
      project_id: 'project-1',
      assignee_id: null,
      parent_id: null,
      ticket_number: null,
      story_points: null,
      estimated_hours: null,
      actual_hours: null,
      tags: [],
      custom_fields: {},
      created_by: 'user-1',
      updated_by: 'user-1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: '2',
      title: 'In Progress Item',
      description: '',
      type: SprintModels.WorkItem.WorkItemType.Story,
      status: WorkItemStatus.InProgress,
      priority: SprintModels.WorkItem.WorkItemPriority.Medium,
      sprint_id: 'sprint-1',
      project_id: 'project-1',
      assignee_id: null,
      parent_id: null,
      ticket_number: null,
      story_points: null,
      estimated_hours: null,
      actual_hours: null,
      tags: [],
      custom_fields: {},
      created_by: 'user-1',
      updated_by: 'user-1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: '3',
      title: 'Done Item',
      description: '',
      type: SprintModels.WorkItem.WorkItemType.Story,
      status: WorkItemStatus.Done,
      priority: SprintModels.WorkItem.WorkItemPriority.Medium,
      sprint_id: 'sprint-1',
      project_id: 'project-1',
      assignee_id: null,
      parent_id: null,
      ticket_number: null,
      story_points: null,
      estimated_hours: null,
      actual_hours: null,
      tags: [],
      custom_fields: {},
      created_by: 'user-1',
      updated_by: 'user-1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SprintBoardComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SprintBoardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('workItems', mockWorkItems);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 4 columns', () => {
    expect(component.columns.length).toBe(4);
  });

  it('should filter todo items correctly', () => {
    const todoItems = component.todoItems();
    expect(todoItems.length).toBe(1);
    expect(todoItems[0].id).toBe('1');
  });

  it('should filter in-progress items correctly', () => {
    const inProgressItems = component.inProgressItems();
    expect(inProgressItems.length).toBe(1);
    expect(inProgressItems[0].id).toBe('2');
  });

  it('should filter done items correctly', () => {
    const doneItems = component.doneItems();
    expect(doneItems.length).toBe(1);
    expect(doneItems[0].id).toBe('3');
  });

  it('should get column items by column id', () => {
    const todoItems = component.getColumnItems('todo');
    expect(todoItems.length).toBe(1);
    expect(todoItems[0].status).toBe(WorkItemStatus.Todo);
  });

  it('should get connected lists excluding current column', () => {
    const connectedLists = component.getConnectedLists('todo');
    expect(connectedLists.length).toBe(3);
    expect(connectedLists).not.toContain('todo');
  });

  it('should emit workItemClicked when item is clicked', () => {
    let emittedId: string | undefined;
    component.workItemClicked.subscribe((id) => {
      emittedId = id;
    });

    component.onWorkItemClick('1');
    expect(emittedId).toBe('1');
  });

  it('should emit workItemStatusChanged on drop', () => {
    let emittedEvent: { id: string; status: WorkItemStatus } | undefined;
    component.workItemStatusChanged.subscribe((event) => {
      emittedEvent = event;
    });

    const mockDragEvent = {
      item: { data: mockWorkItems[0] },
    } as CdkDragDrop<WorkItem[]>;

    component.onDrop(mockDragEvent, 'in-progress');

    expect(emittedEvent).toBeDefined();
    expect(emittedEvent?.id).toBe('1');
    expect(emittedEvent?.status).toBe(WorkItemStatus.InProgress);
  });

  it('should not emit event if status unchanged on drop', () => {
    let emitted = false;
    component.workItemStatusChanged.subscribe(() => {
      emitted = true;
    });

    const mockDragEvent = {
      item: { data: mockWorkItems[0] },
    } as CdkDragDrop<WorkItem[]>;

    component.onDrop(mockDragEvent, 'todo');

    expect(emitted).toBe(false);
  });

  it('should return correct type icon', () => {
    expect(component.getTypeIcon('story')).toBe('book');
    expect(component.getTypeIcon('defect')).toBe('bug_report');
    expect(component.getTypeIcon('epic')).toBe('flag');
    expect(component.getTypeIcon('unknown')).toBe('assignment');
  });

  it('should return correct priority color', () => {
    expect(component.getPriorityColor('Critical')).toBe('warn');
    expect(component.getPriorityColor('High')).toBe('accent');
    expect(component.getPriorityColor('Medium')).toBe('primary');
    expect(component.getPriorityColor('Low')).toBe('');
  });
});
