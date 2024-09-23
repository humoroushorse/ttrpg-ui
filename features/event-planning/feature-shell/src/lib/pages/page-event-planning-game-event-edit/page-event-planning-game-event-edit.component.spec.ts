import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageEventPlanningGameEventEditComponent } from './page-event-planning-game-event-edit.component';

describe('PageEventPlanningGameEventEditComponent', () => {
  let component: PageEventPlanningGameEventEditComponent;
  let fixture: ComponentFixture<PageEventPlanningGameEventEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageEventPlanningGameEventEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageEventPlanningGameEventEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
