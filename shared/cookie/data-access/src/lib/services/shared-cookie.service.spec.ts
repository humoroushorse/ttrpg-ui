import { TestBed } from '@angular/core/testing';

import { SharedCookieService } from './shared-cookie.service';

describe('SharedCookieService', () => {
  let service: SharedCookieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedCookieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
