import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { AUTH_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/features/auth/models';
import { SHARED_CORE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/core/models';
import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';
import { PageAuthUnauthorizedComponent } from './page-auth-unauthorized.component';

describe('PageAuthUnauthorizedComponent', () => {
  let component: PageAuthUnauthorizedComponent;
  let fixture: ComponentFixture<PageAuthUnauthorizedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageAuthUnauthorizedComponent],
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
          provide: ActivatedRoute,
          useValue: { params: of({}) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageAuthUnauthorizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
