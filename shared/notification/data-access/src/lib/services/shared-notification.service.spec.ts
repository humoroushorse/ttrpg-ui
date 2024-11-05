import { TestBed } from '@angular/core/testing';

import { SharedNotificationService } from './shared-notification.service';

describe('SharedNotificationService', () => {
  let service: SharedNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
