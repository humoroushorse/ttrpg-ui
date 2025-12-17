import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SHARED_THEME_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/theme/models';
import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';
import { SharedThemePickerComponent } from './shared-theme-picker.component';

describe('SharedThemePickerComponent', () => {
  let component: SharedThemePickerComponent;
  let fixture: ComponentFixture<SharedThemePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedThemePickerComponent],
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
    }).compileComponents();

    fixture = TestBed.createComponent(SharedThemePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
