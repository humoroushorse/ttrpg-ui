import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventPlanningGameSessionCreateFormComponent } from './event-planning-game-session-create-form.component';

describe('EventPlanningGameSessionCreateFormComponent', () => {
  let component: EventPlanningGameSessionCreateFormComponent;
  let fixture: ComponentFixture<EventPlanningGameSessionCreateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventPlanningGameSessionCreateFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventPlanningGameSessionCreateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
