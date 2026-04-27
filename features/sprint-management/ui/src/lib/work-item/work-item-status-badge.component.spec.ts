import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkItemStatusBadgeComponent } from './work-item-status-badge.component';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { WorkItemStatus } = SprintModels.WorkItem;

describe('WorkItemStatusBadgeComponent', () => {
  let component: WorkItemStatusBadgeComponent;
  let fixture: ComponentFixture<WorkItemStatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkItemStatusBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkItemStatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply correct color class for done status', () => {
    fixture.componentRef.setInput('status', WorkItemStatus.Done);
    fixture.detectChanges();
    expect(component.colorClass()).toBe('status-done');
  });

  it('should apply correct color class for in-progress status', () => {
    fixture.componentRef.setInput('status', WorkItemStatus.InProgress);
    fixture.detectChanges();
    expect(component.colorClass()).toBe('status-in-progress');
  });

  it('should apply correct color class for in-review status', () => {
    fixture.componentRef.setInput('status', WorkItemStatus.InReview);
    fixture.detectChanges();
    expect(component.colorClass()).toBe('status-in-review');
  });

  it('should apply correct color class for todo status', () => {
    fixture.componentRef.setInput('status', WorkItemStatus.Todo);
    fixture.detectChanges();
    expect(component.colorClass()).toBe('status-todo');
  });

  it('should apply correct color class for backlog status', () => {
    fixture.componentRef.setInput('status', WorkItemStatus.Backlog);
    fixture.detectChanges();
    expect(component.colorClass()).toBe('status-backlog');
  });
});
