import { Component, input } from '@angular/core';

import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'lib-user-avatar',
  imports: [MatTooltipModule],
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss',
})
export class UserAvatarComponent {
  user = input<{ username: string; profile_picture_url?: string }>();

  imageAlt = input<string | null>(null);
}
