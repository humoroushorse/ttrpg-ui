import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageEventPlanningGameEventViewComponent } from './page-event-planning-game-event-view.component';

describe('PageEventPlanningGameEventViewComponent', () => {
  let component: PageEventPlanningGameEventViewComponent;
  let fixture: ComponentFixture<PageEventPlanningGameEventViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageEventPlanningGameEventViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageEventPlanningGameEventViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
