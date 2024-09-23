import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageEventPlanningNotFoundComponent } from './page-event-planning-not-found.component';

describe('PageEventPlanningNotFoundComponent', () => {
  let component: PageEventPlanningNotFoundComponent;
  let fixture: ComponentFixture<PageEventPlanningNotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageEventPlanningNotFoundComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageEventPlanningNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
