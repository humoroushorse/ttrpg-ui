import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'lib-user-avatar-list',
    imports: [CommonModule, UserAvatarComponent, MatChipsModule, MatTooltipModule],
    templateUrl: './user-avatar-list.component.html',
    styleUrl: './user-avatar-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserAvatarListComponent {

  users = input<{ username: string; profile_picture_url?: string }[] | null>();

  userCap = input<number>(6);

  emptyListText = input<string>('No users yet!');

  usersTruncated = computed<{ username: string; profile_picture_url?: string }[]>(() => this.users()?.slice(0, this.userCap()) || [])

  usersTruncatedTooltip = computed<string>(() => {
    const truncated = this.users()?.slice(this.userCap()) || []
    const trucncatedNames = truncated.map(u => u.username)
    return trucncatedNames.join(", ")
  })

}
