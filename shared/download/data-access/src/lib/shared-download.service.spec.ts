import { TestBed } from '@angular/core/testing';

import { SharedDownloadService } from './shared-download.service';

describe('SharedDownloadService', () => {
  let service: SharedDownloadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedDownloadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
