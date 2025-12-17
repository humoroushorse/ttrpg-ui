import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';
import { SharedTableToolsColumnSettingsComponent } from './shared-table-tools-column-settings.component';

describe('SharedTableToolsColumnSettingsComponent', () => {
  let component: SharedTableToolsColumnSettingsComponent;
  let fixture: ComponentFixture<SharedTableToolsColumnSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedTableToolsColumnSettingsComponent],
      providers: [
        {
          provide: SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN,
          useValue: { namespace: 'test' },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedTableToolsColumnSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
