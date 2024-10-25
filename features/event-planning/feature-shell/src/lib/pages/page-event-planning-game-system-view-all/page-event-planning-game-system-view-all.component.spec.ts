import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageEventPlanningGameSystemViewAllComponent } from './page-event-planning-game-system-view-all.component';

describe('PageEventPlanningGameSystemViewAllComponent', () => {
  let component: PageEventPlanningGameSystemViewAllComponent;
  let fixture: ComponentFixture<PageEventPlanningGameSystemViewAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageEventPlanningGameSystemViewAllComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageEventPlanningGameSystemViewAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
