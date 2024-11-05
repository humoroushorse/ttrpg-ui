import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventPlanningGameSessionTableActionsComponent } from './event-planning-game-session-table-actions.component';

describe('EventPlanningGameSessionTableActionsComponent', () => {
  let component: EventPlanningGameSessionTableActionsComponent;
  let fixture: ComponentFixture<EventPlanningGameSessionTableActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventPlanningGameSessionTableActionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventPlanningGameSessionTableActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
