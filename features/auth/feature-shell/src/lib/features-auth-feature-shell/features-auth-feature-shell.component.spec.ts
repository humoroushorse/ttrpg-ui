import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AUTH_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/features/auth/models';
import { SHARED_CORE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/core/models';
import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';
import { FeaturesAuthFeatureShellComponent } from './features-auth-feature-shell.component';

describe('FeaturesAuthFeatureShellComponent', () => {
  let component: FeaturesAuthFeatureShellComponent;
  let fixture: ComponentFixture<FeaturesAuthFeatureShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturesAuthFeatureShellComponent],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        {
          provide: AUTH_SERVICE_CONFIG_TOKEN,
          useValue: { apiUrl: 'http://test' },
        },
        {
          provide: SHARED_CORE_SERVICE_CONFIG_TOKEN,
          useValue: { apiUrl: 'http://test' },
        },
        {
          provide: SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN,
          useValue: { namespace: 'test' },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturesAuthFeatureShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
