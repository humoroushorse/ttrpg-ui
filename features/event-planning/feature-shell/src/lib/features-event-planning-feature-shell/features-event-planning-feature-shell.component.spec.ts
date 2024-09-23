import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeaturesEventPlanningFeatureShellComponent } from './features-event-planning-feature-shell.component';

describe('FeaturesEventPlanningFeatureShellComponent', () => {
  let component: FeaturesEventPlanningFeatureShellComponent;
  let fixture: ComponentFixture<FeaturesEventPlanningFeatureShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturesEventPlanningFeatureShellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturesEventPlanningFeatureShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
