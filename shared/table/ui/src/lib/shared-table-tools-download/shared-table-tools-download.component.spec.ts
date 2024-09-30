import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedTableToolsDownloadComponent } from './shared-table-tools-download.component';

describe('SharedTableToolsDownloadComponent', () => {
  let component: SharedTableToolsDownloadComponent;
  let fixture: ComponentFixture<SharedTableToolsDownloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedTableToolsDownloadComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedTableToolsDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
