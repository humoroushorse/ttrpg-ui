import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventPlanningGameSystemCreateFormComponent } from './event-planning-game-system-create-form.component';

describe('EventPlanningGameSystemCreateFormComponent', () => {
  let component: EventPlanningGameSystemCreateFormComponent;
  let fixture: ComponentFixture<EventPlanningGameSystemCreateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventPlanningGameSystemCreateFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventPlanningGameSystemCreateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
