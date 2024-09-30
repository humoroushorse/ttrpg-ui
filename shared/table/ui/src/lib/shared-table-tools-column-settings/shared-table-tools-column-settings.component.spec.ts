import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedTableToolsColumnSettingsComponent } from './shared-table-tools-column-settings.component';

describe('SharedTableToolsColumnSettingsComponent', () => {
  let component: SharedTableToolsColumnSettingsComponent;
  let fixture: ComponentFixture<SharedTableToolsColumnSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedTableToolsColumnSettingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedTableToolsColumnSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
