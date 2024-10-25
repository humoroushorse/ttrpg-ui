import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageEventPlanningGameSystemViewComponent } from './page-event-planning-game-system-view.component';

describe('PageEventPlanningGameSystemViewComponent', () => {
  let component: PageEventPlanningGameSystemViewComponent;
  let fixture: ComponentFixture<PageEventPlanningGameSystemViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageEventPlanningGameSystemViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageEventPlanningGameSystemViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
