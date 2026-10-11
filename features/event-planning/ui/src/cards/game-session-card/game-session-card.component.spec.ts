import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AUTH_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/features/auth/models';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { SHARED_CORE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/core/models';
import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';
import { GameSessionCardComponent } from './game-session-card.component';

describe('GameSessionCardComponent', () => {
  let component: GameSessionCardComponent;
  let fixture: ComponentFixture<GameSessionCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameSessionCardComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        {
          provide: AUTH_SERVICE_CONFIG_TOKEN,
          useValue: { appConfig: () => ({ APP_TTRPG_EVENT_PLANNING__API_BASE_PATH: 'http://test' }) },
        },
        {
          provide: EventPlanningModels.Service.EVENT_PLANNING_API_SERVICE_CONFIG_TOKEN,
          useValue: { appConfig: () => ({ APP_TTRPG_EVENT_PLANNING__API_BASE_PATH: 'http://test' }) },
        },
        {
          provide: SHARED_CORE_SERVICE_CONFIG_TOKEN,
          useValue: { appConfig: () => ({ APP_TTRPG_EVENT_PLANNING__API_BASE_PATH: 'http://test' }) },
        },
        {
          provide: SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN,
          useValue: { namespace: 'test' },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameSessionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
