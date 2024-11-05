import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventPlanningGameSystemTableActionsComponent } from './event-planning-game-system-table-actions.component';

describe('EventPlanningGameSystemTableActionsComponent', () => {
  let component: EventPlanningGameSystemTableActionsComponent;
  let fixture: ComponentFixture<EventPlanningGameSystemTableActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventPlanningGameSystemTableActionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventPlanningGameSystemTableActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
