import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeaturesAuthFeatureShellComponent } from './features-auth-feature-shell.component';

describe('FeaturesAuthFeatureShellComponent', () => {
  let component: FeaturesAuthFeatureShellComponent;
  let fixture: ComponentFixture<FeaturesAuthFeatureShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturesAuthFeatureShellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturesAuthFeatureShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
