import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { SHARED_THEME_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/theme/models';
import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';
import { SHARED_CORE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/core/models';
import { AUTH_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/features/auth/models';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterModule.forRoot([])],
      providers: [
        provideHttpClient(withXhr()),
        {
          provide: SHARED_THEME_SERVICE_CONFIG_TOKEN,
          useValue: { themes: [{ name: 'light', path: 'light.css' }] },
        },
        {
          provide: SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN,
          useValue: { appName: 'test' },
        },
        {
          provide: SHARED_CORE_SERVICE_CONFIG_TOKEN,
          useValue: { appTitle: 'test', toolbarHeight: 64 },
        },
        {
          provide: AUTH_SERVICE_CONFIG_TOKEN,
          useValue: { authAppBaseRoute: ['auth'], authAppLoginRoute: ['login'] },
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have app title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance.appTitle).toBe('test');
  });

  it('should render title in toolbar', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('test');
  });
});
