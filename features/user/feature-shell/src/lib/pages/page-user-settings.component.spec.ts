import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AUTH_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/features/auth/models';
import { SHARED_CORE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/core/models';
import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';
import { SHARED_THEME_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/theme/models';
import { PageUserSettingsComponent } from './page-user-settings.component';

describe('PageUserSettingsComponent', () => {
  let component: PageUserSettingsComponent;
  let fixture: ComponentFixture<PageUserSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageUserSettingsComponent],
      providers: [
        provideHttpClient(),
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
        {
          provide: SHARED_THEME_SERVICE_CONFIG_TOKEN,
          useValue: { themes: [{ name: 'light', path: '/light.css' }] },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageUserSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
