import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageEventPlanningGameSystemEditComponent } from './page-event-planning-game-system-edit.component';

describe('PageEventPlanningGameSystemEditComponent', () => {
  let component: PageEventPlanningGameSystemEditComponent;
  let fixture: ComponentFixture<PageEventPlanningGameSystemEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageEventPlanningGameSystemEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageEventPlanningGameSystemEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
