import { ChangeDetectionStrategy, Component, computed, DOCUMENT, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { of } from 'rxjs';
import { getErrorMessage } from '@ttrpg-ui/shared/store/util';
import { DndCampaignModels } from '@ttrpg-ui/features/dnd/campaigns/models';
import { DndCampaignApiService } from '@ttrpg-ui/features/dnd/campaigns/data-access';

type Campaign = DndCampaignModels.Campaigns.CampaignSchema;
type Lifetime = DndCampaignModels.Campaigns.InviteLifetime;

const LIFETIMES: { value: Lifetime; label: string }[] = [
  { value: '1h', label: '1 hour' },
  { value: '1d', label: '1 day' },
  { value: '7d', label: '7 days' },
];

/**
 * Inviting players: a link (open for an hour, a day or a week, with an optional use limit, shown once),
 * or an invite for one user by username, which waits for them to accept. DMs also see the open
 * invites and revoke them. Shown to whoever may invite (the DMs, or every member when the campaign
 * allows it).
 */
@Component({
  selector: 'lib-dnd-campaign-invites',
  imports: [
    DatePipe,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
  ],
  templateUrl: './campaign-invites.component.html',
  styleUrl: './campaign-invites.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DndCampaignInvitesComponent {
  private readonly api = inject(DndCampaignApiService);

  private readonly document = inject(DOCUMENT);

  readonly campaign = input.required<Campaign>();

  protected readonly lifetimes = LIFETIMES;

  protected readonly lifetime = signal<Lifetime>('1d');

  protected readonly maxUses = signal<number | null>(null);

  protected readonly username = signal('');

  /** The link just made: its token is shown only now */
  protected readonly link = signal<string | null>(null);

  protected readonly copied = signal(false);

  protected readonly saving = signal(false);

  protected readonly error = signal<string | null>(null);

  protected readonly notice = signal<string | null>(null);

  private readonly version = signal(0);

  protected readonly isDM = computed(() => this.campaign().role === 'dm');

  /** The open invites, for the DMs */
  protected readonly invites = rxResource({
    params: () => ({ id: this.campaign().id, dm: this.isDM(), version: this.version() }),
    stream: ({ params }) => (params.dm ? this.api.getInvites(params.id) : of({ entities: [] })),
  });

  onMaxUses(value: number): void {
    this.maxUses.set(Number.isInteger(value) && value >= 1 ? value : null);
  }

  onCreateLink(): void {
    this.start();
    this.api.createInvite(this.campaign().id, { expires_in: this.lifetime(), max_uses: this.maxUses() }).subscribe({
      next: (made) => {
        const base = this.document.baseURI.replace(/\/$/, '');
        this.link.set(made.token ? `${base}/dnd/campaigns/join/${made.token}` : null);
        this.done();
      },
      error: (error: unknown) => this.fail(error),
    });
  }

  onInviteUser(): void {
    const username = this.username().trim();
    if (!username) return;
    this.start();
    this.api.createInvite(this.campaign().id, { expires_in: this.lifetime(), username }).subscribe({
      next: () => {
        this.username.set('');
        this.notice.set(`Invited ${username}. It shows on their Campaigns page until they accept or decline.`);
        this.done();
      },
      error: (error: unknown) => this.fail(error),
    });
  }

  onRevoke(inviteId: string): void {
    this.start();
    this.api.revokeInvite(this.campaign().id, inviteId).subscribe({
      next: () => this.done(),
      error: (error: unknown) => this.fail(error),
    });
  }

  async onCopy(link: string): Promise<void> {
    await navigator.clipboard.writeText(link);
    this.copied.set(true);
  }

  private start(): void {
    this.saving.set(true);
    this.error.set(null);
    this.notice.set(null);
    this.copied.set(false);
  }

  private done(): void {
    this.saving.set(false);
    this.version.update((v) => v + 1);
  }

  private fail(error: unknown): void {
    this.saving.set(false);
    this.error.set(getErrorMessage(error));
  }
}
