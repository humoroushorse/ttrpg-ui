import { TestBed } from '@angular/core/testing';

import { SharedThemeService } from './shared-theme.service';

describe('SharedThemeService', () => {
  let service: SharedThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
