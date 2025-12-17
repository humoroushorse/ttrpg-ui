import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { DndSpellModels } from '@ttrpg-ui/features/dnd/spells/models';
import { DndSpellApiService } from './dnd-spells-api.service';

describe('DndSpellApiService', () => {
  let service: DndSpellApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        {
          provide: DndSpellModels.Service.DND_SPELL_API_SERVICE_CONFIG_TOKEN,
          useValue: { appConfig: () => ({ APP_TTRPG_DND_SPELL__API_BASE_PATH: 'http://test' }) },
        },
      ],
    });
    service = TestBed.inject(DndSpellApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
