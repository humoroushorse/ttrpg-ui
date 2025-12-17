import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';
import { SharedTableToolsDownloadComponent } from './shared-table-tools-download.component';

describe('SharedTableToolsDownloadComponent', () => {
  let component: SharedTableToolsDownloadComponent;
  let fixture: ComponentFixture<SharedTableToolsDownloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedTableToolsDownloadComponent],
      providers: [
        {
          provide: SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN,
          useValue: { namespace: 'test' },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedTableToolsDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
