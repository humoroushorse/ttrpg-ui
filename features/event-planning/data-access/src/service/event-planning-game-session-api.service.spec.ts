import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { EventPlanningGameSessionApiService } from './event-planning-game-session-api.service';

describe('EventPlanningGameSessionApiService', () => {
  let service: EventPlanningGameSessionApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        {
          provide: EventPlanningModels.Service.EVENT_PLANNING_API_SERVICE_CONFIG_TOKEN,
          useValue: { appConfig: () => ({ APP_TTRPG_EVENT_PLANNING__API_BASE_PATH: 'http://test' }) },
        },
      ],
    });
    service = TestBed.inject(EventPlanningGameSessionApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
