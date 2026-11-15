import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { pageMeta } from '@ttrpg-ui/shared/core/util';
import { getErrorMessage } from '@ttrpg-ui/shared/store/util';
import { DndCampaignModels } from '@ttrpg-ui/features/dnd/campaigns/models';
import { DndCampaignApiService } from '@ttrpg-ui/features/dnd/campaigns/data-access';

/**
 * An invite link: says which campaign it's for and who sent it, then joins as a player. An expired,
 * revoked or used-up link says so.
 */
@Component({
  selector: 'lib-page-dnd-campaigns-join',
  imports: [DatePipe, RouterLink, MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule],
  templateUrl: './page-dnd-campaigns-join.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDndCampaignsJoinComponent {
  private readonly router = inject(Router);

  private readonly api = inject(DndCampaignApiService);

  /** The `:token` route param */
  readonly token = input.required<string>();

  protected readonly preview = rxResource({
    params: () => this.token(),
    stream: ({ params }) => this.api.previewInviteLink(params),
  });

  protected readonly joining = signal(false);

  private readonly joinError = signal<string | null>(null);

  protected readonly errorMessage = computed(() => {
    const error = this.joinError() ?? this.preview.error();
    if (!error) return null;
    if (typeof error === 'string') return error;
    if (error instanceof HttpErrorResponse && error.status === 404) return "This invite link isn't valid.";
    return getErrorMessage(error);
  });

  constructor() {
    pageMeta(() => ({ title: ['Join a Campaign', 'Campaigns'], description: 'Join a campaign from an invite link.' }));
  }

  onJoin(): void {
    this.joining.set(true);
    this.joinError.set(null);
    this.api.acceptInviteLink(this.token()).subscribe({
      next: (campaign) => this.router.navigate(DndCampaignModels.Campaigns.campaignRoute(campaign)),
      error: (error: unknown) => {
        this.joining.set(false);
        this.joinError.set(getErrorMessage(error));
      },
    });
  }
}
