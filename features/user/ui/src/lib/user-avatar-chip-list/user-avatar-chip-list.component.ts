import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { UserAvatarChipComponent } from '../user-avatar-chip/user-avatar-chip.component';

@Component({
  selector: 'lib-user-avatar-chip-list',
  standalone: true,
  imports: [CommonModule, UserAvatarChipComponent, MatChipsModule],
  templateUrl: './user-avatar-chip-list.component.html',
  styleUrl: './user-avatar-chip-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatarChipListComponent {
  users = input<{ username: string; profile_picture_url?: string }[] | null>();

  emptyListText = input<string>('No users yet!');
}

