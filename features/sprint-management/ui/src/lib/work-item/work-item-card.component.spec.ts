import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { WorkItemCardComponent } from './work-item-card.component';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { WorkItemStatus, WorkItemType, WorkItemPriority } = SprintModels.WorkItem;
type WorkItem = SprintModels.WorkItem.WorkItem;

describe('WorkItemCardComponent', () => {
  let component: WorkItemCardComponent;
  let fixture: ComponentFixture<WorkItemCardComponent>;

  const mockWorkItem: WorkItem = {
    id: 'work-item-1',
    title: 'Test Work Item',
    description: 'Test description',
    status: WorkItemStatus.Todo,
    type: WorkItemType.Story,
    priority: WorkItemPriority.High,
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
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkItemCardComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkItemCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('workItem', mockWorkItem);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display work item title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Work Item');
  });

  it('should emit cardClicked event when card is clicked', () => {
    let emitted = false;
    component.cardClicked.subscribe(() => {
      emitted = true;
    });

    component.onCardClick();
    expect(emitted).toBe(true);
  });
});
