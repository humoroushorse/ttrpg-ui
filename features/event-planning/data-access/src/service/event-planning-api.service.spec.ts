import { TestBed } from '@angular/core/testing';

import { EventPlanningApiService } from './event-planning-api.service';

describe('EventPlanningApiService', () => {
  let service: EventPlanningApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventPlanningApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
