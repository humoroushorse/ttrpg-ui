import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageEventPlanningGameEventCreateComponent } from './page-event-planning-game-event-create.component';

describe('PageEventPlanningGameEventCreateComponent', () => {
  let component: PageEventPlanningGameEventCreateComponent;
  let fixture: ComponentFixture<PageEventPlanningGameEventCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageEventPlanningGameEventCreateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageEventPlanningGameEventCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
