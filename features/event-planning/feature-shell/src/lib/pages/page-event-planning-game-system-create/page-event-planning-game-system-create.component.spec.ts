import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageEventPlanningGameSystemCreateComponent } from './page-event-planning-game-system-create.component';

describe('PageEventPlanningGameSystemCreateComponent', () => {
  let component: PageEventPlanningGameSystemCreateComponent;
  let fixture: ComponentFixture<PageEventPlanningGameSystemCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageEventPlanningGameSystemCreateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageEventPlanningGameSystemCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
