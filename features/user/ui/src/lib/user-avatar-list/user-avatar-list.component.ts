import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'lib-user-avatar-list',
  standalone: true,
  imports: [CommonModule, UserAvatarComponent, MatChipsModule],
  templateUrl: './user-avatar-list.component.html',
  styleUrl: './user-avatar-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatarListComponent {
  users = input<{ username: string; profile_picture_url?: string }[] | null>();

  emptyListText = input<string>('No users yet!');
}
