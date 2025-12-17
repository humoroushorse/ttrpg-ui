import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SHARED_CORE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/core/models';
import { FeaturesUserFeatureShellComponent } from './features-user-feature-shell.component';

describe('FeaturesUserFeatureShellComponent', () => {
  let component: FeaturesUserFeatureShellComponent;
  let fixture: ComponentFixture<FeaturesUserFeatureShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturesUserFeatureShellComponent],
      providers: [
        {
          provide: SHARED_CORE_SERVICE_CONFIG_TOKEN,
          useValue: { apiUrl: 'http://test' },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturesUserFeatureShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
