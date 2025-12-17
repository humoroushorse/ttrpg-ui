import { TestBed } from '@angular/core/testing';

import { SHARED_THEME_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/theme/models';
import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';
import { SharedThemeService } from './shared-theme.service';

describe('SharedThemeService', () => {
  let service: SharedThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SHARED_THEME_SERVICE_CONFIG_TOKEN,
          useValue: { themes: [{ name: 'light', path: '/light.css' }] },
        },
        {
          provide: SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN,
          useValue: { namespace: 'test' },
        },
      ],
    });
    service = TestBed.inject(SharedThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
