import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SprintProgressComponent } from './sprint-progress.component';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

type SprintWithMetrics = SprintModels.Sprint.SprintWithMetrics;

describe('SprintProgressComponent', () => {
  let component: SprintProgressComponent;
  let fixture: ComponentFixture<SprintProgressComponent>;

  const mockSprint: SprintWithMetrics = {
    id: '1',
    name: 'Sprint 1',
    goal: 'Complete features',
    start_date: '2024-01-01',
    end_date: '2024-01-14',
    status: 'active',
    project_id: 'proj-1',
    total_items: 10,
    completed_items: 5,
    in_progress_items: 3,
    blocked_items: 3,
    total_story_points: 50,
    completed_story_points: 25,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    created_by: 'user-1',
    updated_by: 'user-1',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SprintProgressComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SprintProgressComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('sprint', mockSprint);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate completion percentage correctly', () => {
    expect(component.completionPercentage()).toBe(50);
  });

  it('should calculate in progress percentage correctly', () => {
    expect(component.inProgressPercentage()).toBe(30);
  });

  it('should calculate blocked percentage correctly', () => {
    expect(component.blockedPercentage()).toBe(30);
  });

  it('should calculate remaining items correctly', () => {
    expect(component.remainingItems()).toBe(5);
  });

  it('should calculate story points percentage correctly', () => {
    expect(component.storyPointsPercentage()).toBe(50);
  });

  it('should calculate remaining story points correctly', () => {
    expect(component.remainingStoryPoints()).toBe(25);
  });

  it('should return 0 for completion percentage when total items is 0', () => {
    const emptySprint = { ...mockSprint, total_items: 0, completed_items: 0 };
    fixture.componentRef.setInput('sprint', emptySprint);
    fixture.detectChanges();
    expect(component.completionPercentage()).toBe(0);
  });

  it('should return correct progress color based on completion', () => {
    expect(component.getProgressColor()).toBe('accent');

    const highCompletionSprint = {
      ...mockSprint,
      completed_items: 8,
      total_items: 10,
    };
    fixture.componentRef.setInput('sprint', highCompletionSprint);
    fixture.detectChanges();
    expect(component.getProgressColor()).toBe('primary');

    const lowCompletionSprint = {
      ...mockSprint,
      completed_items: 2,
      total_items: 10,
    };
    fixture.componentRef.setInput('sprint', lowCompletionSprint);
    fixture.detectChanges();
    expect(component.getProgressColor()).toBe('warn');
  });

  it('should return correct health icon based on sprint status', () => {
    expect(component.getHealthIcon()).toBe('error');

    const completedSprint = {
      ...mockSprint,
      completed_items: 10,
      total_items: 10,
      blocked_items: 0,
    };
    fixture.componentRef.setInput('sprint', completedSprint);
    fixture.detectChanges();
    expect(component.getHealthIcon()).toBe('check_circle');

    const inProgressSprint = {
      ...mockSprint,
      blocked_items: 1,
      in_progress_items: 5,
    };
    fixture.componentRef.setInput('sprint', inProgressSprint);
    fixture.detectChanges();
    expect(component.getHealthIcon()).toBe('pending');
  });

  it('should return correct health status text', () => {
    expect(component.getHealthStatus()).toBe('At Risk');

    const completedSprint = {
      ...mockSprint,
      completed_items: 10,
      total_items: 10,
      blocked_items: 0,
    };
    fixture.componentRef.setInput('sprint', completedSprint);
    fixture.detectChanges();
    expect(component.getHealthStatus()).toBe('Completed');

    const inProgressSprint = {
      ...mockSprint,
      blocked_items: 1,
      in_progress_items: 5,
    };
    fixture.componentRef.setInput('sprint', inProgressSprint);
    fixture.detectChanges();
    expect(component.getHealthStatus()).toBe('On Track');
  });
});
