import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';
import { AUTH_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/features/auth/models';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { SHARED_CORE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/core/models';
import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';
import { PageEventPlanningGameSessionEditComponent } from './page-event-planning-game-session-edit.component';

describe('PageEventPlanningGameSessionEditComponent', () => {
  let component: PageEventPlanningGameSessionEditComponent;
  let fixture: ComponentFixture<PageEventPlanningGameSessionEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageEventPlanningGameSessionEditComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        provideNativeDateAdapter(),
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
        { provide: SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN, useValue: { namespace: 'test' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageEventPlanningGameSessionEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
