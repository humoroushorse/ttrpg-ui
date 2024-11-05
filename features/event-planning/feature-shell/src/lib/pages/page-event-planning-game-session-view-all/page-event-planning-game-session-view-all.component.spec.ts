import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageEventPlanningGameEventViewAllComponent } from './page-event-planning-game-session-view-all.component';

describe('PageEventPlanningGameEventViewAllComponent', () => {
  let component: PageEventPlanningGameEventViewAllComponent;
  let fixture: ComponentFixture<PageEventPlanningGameEventViewAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageEventPlanningGameEventViewAllComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageEventPlanningGameEventViewAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
