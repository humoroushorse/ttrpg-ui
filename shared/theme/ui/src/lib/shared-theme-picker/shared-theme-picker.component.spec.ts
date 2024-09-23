import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedThemePickerComponent } from './shared-theme-picker.component';

describe('SharedThemePickerComponent', () => {
  let component: SharedThemePickerComponent;
  let fixture: ComponentFixture<SharedThemePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedThemePickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedThemePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
