import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { getErrorMessage } from '@ttrpg-ui/shared/store/util';
import { DndCampaignModels } from '@ttrpg-ui/features/dnd/campaigns/models';
import { DndCampaignApiService, Entities } from '@ttrpg-ui/features/dnd/campaigns/data-access';

type Campaign = DndCampaignModels.Campaigns.CampaignSchema;
type Member = DndCampaignModels.Campaigns.CampaignMember;

/**
 * Who's in the campaign, with a role tag each (Owner, DM, Player). DMs make a member a DM or a player
 * and remove members; anyone but the owner can leave. Removing or leaving takes that member's
 * characters out too. `changed` asks the page to reload; `left` says the caller is no longer in it.
 */
@Component({
  selector: 'lib-dnd-campaign-members',
  imports: [MatButtonModule, MatChipsModule, MatIconModule],
  templateUrl: './campaign-members.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DndCampaignMembersComponent {
  private readonly api = inject(DndCampaignApiService);

  readonly campaign = input.required<Campaign>();

  readonly members = input.required<Member[]>();

  readonly changed = output<void>();

  readonly left = output<void>();

  protected readonly saving = signal(false);

  protected readonly error = signal<string | null>(null);

  onRole(m: Member, role: DndCampaignModels.Campaigns.CampaignRole): void {
    this.run(this.api.setMemberRole(this.campaign().id, m.user_id, role));
  }

  onRemove(m: Member): void {
    const leaving = m.me;
    const text = leaving
      ? `Leave ${this.campaign().name}? Your characters leave it with you and go back to their own rules.`
      : `Remove ${m.username ?? 'this member'}? Their characters leave the campaign with them.`;
    if (!confirm(text)) return;
    this.run(this.api.removeMember(this.campaign().id, m.user_id), leaving);
  }

  private run(write: Observable<Entities<Member>>, leaving = false): void {
    this.saving.set(true);
    this.error.set(null);
    write.subscribe({
      next: () => {
        this.saving.set(false);
        if (leaving) this.left.emit();
        else this.changed.emit();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.error.set(getErrorMessage(error));
      },
    });
  }
}
