import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkItemTableActionsComponent } from './work-item-table-actions.component';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

type WorkItem = SprintModels.WorkItem.WorkItem;

describe('WorkItemTableActionsComponent', () => {
  let component: WorkItemTableActionsComponent;
  let fixture: ComponentFixture<WorkItemTableActionsComponent>;

  const mockWorkItem: WorkItem = {
    id: '1',
    title: 'Test Work Item',
    description: 'Test description',
    type: 'story',
    status: 'todo',
    priority: 'medium',
    project_id: 'proj-1',
    assignee_id: null,
    sprint_id: null,
    parent_id: null,
    story_points: null,
    estimated_hours: null,
    tags: [],
    custom_fields: {},
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'user-1',
    updated_by: 'user-1',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkItemTableActionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkItemTableActionsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('workItem', mockWorkItem);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit viewClicked when onView is called', () => {
    let emittedValue: WorkItem | undefined;
    component.viewClicked.subscribe((value) => (emittedValue = value));
    component.onView();
    expect(emittedValue).toEqual(mockWorkItem);
  });

  it('should emit editClicked when onEdit is called', () => {
    let emittedValue: WorkItem | undefined;
    component.editClicked.subscribe((value) => (emittedValue = value));
    component.onEdit();
    expect(emittedValue).toEqual(mockWorkItem);
  });

  it('should emit deleteClicked when onDelete is called', () => {
    let emittedValue: WorkItem | undefined;
    component.deleteClicked.subscribe((value) => (emittedValue = value));
    component.onDelete();
    expect(emittedValue).toEqual(mockWorkItem);
  });
});
