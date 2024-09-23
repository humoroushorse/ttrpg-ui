import { TestBed } from '@angular/core/testing';

import { SharedLocalStorageService } from './shared-local-storage.service';

describe('SharedLocalStorageService', () => {
  let service: SharedLocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedLocalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
