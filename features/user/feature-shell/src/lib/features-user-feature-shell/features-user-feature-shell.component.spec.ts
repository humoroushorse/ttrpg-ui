import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeaturesUserFeatureShellComponent } from './features-user-feature-shell.component';

describe('FeaturesUserFeatureShellComponent', () => {
  let component: FeaturesUserFeatureShellComponent;
  let fixture: ComponentFixture<FeaturesUserFeatureShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturesUserFeatureShellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturesUserFeatureShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
