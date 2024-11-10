import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserAvatarChipComponent } from './user-avatar-chip.component';

describe('UserAvatarChipComponent', () => {
  let component: UserAvatarChipComponent;
  let fixture: ComponentFixture<UserAvatarChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAvatarChipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserAvatarChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
