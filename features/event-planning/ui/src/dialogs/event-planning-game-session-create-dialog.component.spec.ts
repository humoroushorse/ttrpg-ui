import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventPlanningGameSessionCreateDialogComponent } from './event-planning-game-session-create-dialog.component';

describe('EventPlanningGameSessionCreateDialogComponent', () => {
  let component: EventPlanningGameSessionCreateDialogComponent;
  let fixture: ComponentFixture<EventPlanningGameSessionCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventPlanningGameSessionCreateDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventPlanningGameSessionCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
