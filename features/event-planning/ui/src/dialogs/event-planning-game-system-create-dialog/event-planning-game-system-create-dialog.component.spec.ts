import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventPlanningGameSystemCreateDialogComponent } from './event-planning-game-system-create-dialog.component';

describe('EventPlanningGameSystemCreateDialogComponent', () => {
  let component: EventPlanningGameSystemCreateDialogComponent;
  let fixture: ComponentFixture<EventPlanningGameSystemCreateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventPlanningGameSystemCreateDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventPlanningGameSystemCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
