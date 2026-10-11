import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { AUTH_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/features/auth/models';
import { SHARED_CORE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/core/models';
import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';
import { PageAuthRegisterComponent } from './page-auth-register.component';

describe('PageAuthRegisterComponent', () => {
  let component: PageAuthRegisterComponent;
  let fixture: ComponentFixture<PageAuthRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageAuthRegisterComponent],
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
        {
          provide: ActivatedRoute,
          useValue: { params: of({}) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageAuthRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
