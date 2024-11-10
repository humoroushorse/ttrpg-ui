import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserAvatarChipListComponent } from './user-avatar-chip-list.component';

describe('UserAvatarChipListComponent', () => {
  let component: UserAvatarChipListComponent;
  let fixture: ComponentFixture<UserAvatarChipListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAvatarChipListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserAvatarChipListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
