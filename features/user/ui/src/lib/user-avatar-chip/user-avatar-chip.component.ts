import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'lib-user-avatar-chip',
  standalone: true,
  imports: [CommonModule, MatChipsModule],
  templateUrl: './user-avatar-chip.component.html',
  styleUrl: './user-avatar-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatarChipComponent {
  user = input<{ username: string; profile_picture_url?: string }>();
}
