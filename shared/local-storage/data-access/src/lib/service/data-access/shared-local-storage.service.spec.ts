import { TestBed } from '@angular/core/testing';

import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';
import { SharedLocalStorageService } from './shared-local-storage.service';

describe('SharedLocalStorageService', () => {
  let service: SharedLocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN,
          useValue: { namespace: 'test' },
        },
      ],
    });
    service = TestBed.inject(SharedLocalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
