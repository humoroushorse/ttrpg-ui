import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageDndSpellsViewAllComponent } from './page-dnd-spells-view-all.component';
import { SHARED_CORE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/core/models';
import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';
import { DndSpellModels } from '@ttrpg-ui/features/dnd/spells/models';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('PageDndSpellsViewAllComponent', () => {
  let component: PageDndSpellsViewAllComponent;
  let fixture: ComponentFixture<PageDndSpellsViewAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageDndSpellsViewAllComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: SHARED_CORE_SERVICE_CONFIG_TOKEN,
          useValue: { appTitle: 'Test' },
        },
        {
          provide: SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN,
          useValue: { storageKeyPrefix: 'test' },
        },
        {
          provide: DndSpellModels.Service.DND_SPELL_API_SERVICE_CONFIG_TOKEN,
          useValue: {
            appConfig: () => ({
              APP_TTRPG_DND__API_BASE_PATH: 'http://test/api',
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageDndSpellsViewAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
