import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AUTH_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/features/auth/models';
import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';
import { SHARED_CORE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/core/models';
import { SharedSidenavRouterItemComponent } from './shared-sidenav-router-item.component';

describe('SharedSidenavRouterItemComponent', () => {
  let component: SharedSidenavRouterItemComponent;
  let fixture: ComponentFixture<SharedSidenavRouterItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedSidenavRouterItemComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        {
          provide: AUTH_SERVICE_CONFIG_TOKEN,
          useValue: { appConfig: () => ({ AUTH_BASE_URL: 'http://test' }) },
        },
        {
          provide: SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN,
          useValue: { namespace: 'test' },
        },
        {
          provide: SHARED_CORE_SERVICE_CONFIG_TOKEN,
          useValue: { appTitle: 'Test' },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedSidenavRouterItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
