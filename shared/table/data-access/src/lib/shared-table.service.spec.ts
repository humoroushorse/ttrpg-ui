import { TestBed } from '@angular/core/testing';
import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';
import { SharedTableService } from './shared-table.service';

describe('SharedTableService', () => {
  let service: SharedTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN,
          useValue: { namespace: 'test' },
        },
      ],
    });
    service = TestBed.inject(SharedTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
