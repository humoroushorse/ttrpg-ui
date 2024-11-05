import { TestBed } from '@angular/core/testing';

import { EventPlanningGameSystemApiService } from './event-planning-game-system-api.service';

describe('EventPlanningGameSystemApiService', () => {
  let service: EventPlanningGameSystemApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventPlanningGameSystemApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
