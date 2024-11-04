import { TestBed } from '@angular/core/testing';

import { EventPlanningGameSessionApiService } from './event-planning-game-session-api.service';

describe('EventPlanningGameSessionApiService', () => {
  let service: EventPlanningGameSessionApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventPlanningGameSessionApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
