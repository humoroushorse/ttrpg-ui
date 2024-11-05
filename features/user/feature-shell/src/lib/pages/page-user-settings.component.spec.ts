import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageUserSettingsComponent } from './page-user-settings.component';

describe('PageUserSettingsComponent', () => {
  let component: PageUserSettingsComponent;
  let fixture: ComponentFixture<PageUserSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageUserSettingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageUserSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
