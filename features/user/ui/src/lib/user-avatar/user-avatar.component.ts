import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip'

@Component({
  selector: 'lib-user-avatar',
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatarComponent {
  user = input<{ username: string; profile_picture_url?: string }>();

  imageAlt = input<string | null>(null);
}
