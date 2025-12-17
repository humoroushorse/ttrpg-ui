import { TestBed } from '@angular/core/testing';

import { SHARED_CORE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/core/models';
import { SharedCoreService } from './shared-core.service';

describe('SharedCoreService', () => {
  let service: SharedCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SHARED_CORE_SERVICE_CONFIG_TOKEN,
          useValue: { apiUrl: 'http://test' },
        },
      ],
    });
    service = TestBed.inject(SharedCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
