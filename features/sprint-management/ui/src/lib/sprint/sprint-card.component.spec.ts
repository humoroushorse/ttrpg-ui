import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SprintCardComponent } from './sprint-card.component';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { SprintStatus } = SprintModels.Sprint;
type Sprint = SprintModels.Sprint.Sprint;

describe('SprintCardComponent', () => {
  let component: SprintCardComponent;
  let fixture: ComponentFixture<SprintCardComponent>;

  const mockSprint: Sprint = {
    id: 'sprint-1',
    name: 'Sprint 1',
    status: SprintStatus.Active,
    start_date: '2024-01-01',
    end_date: '2024-01-14',
    goal: 'Complete user authentication',
    project_id: 'project-1',
    description: '',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    created_by: 'user-1',
    updated_by: 'user-1',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SprintCardComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SprintCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('sprint', mockSprint);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display sprint name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Sprint 1');
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
