import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageAuthForgotPasswordComponent } from './page-auth-forgot-password.component';

describe('PageAuthForgotPasswordComponent', () => {
  let component: PageAuthForgotPasswordComponent;
  let fixture: ComponentFixture<PageAuthForgotPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageAuthForgotPasswordComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageAuthForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
