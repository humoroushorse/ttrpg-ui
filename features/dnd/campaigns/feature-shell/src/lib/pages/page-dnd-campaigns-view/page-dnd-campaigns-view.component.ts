import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  Resource,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Observable } from 'rxjs';
import { pageMeta } from '@ttrpg-ui/shared/core/util';
import { getErrorMessage } from '@ttrpg-ui/shared/store/util';
import { SharedFormsSingleSelectComponent } from '@ttrpg-ui/shared/forms/ui';
import { DndCampaignModels } from '@ttrpg-ui/features/dnd/campaigns/models';
import { DndCampaignApiService, DndCampaignsStore } from '@ttrpg-ui/features/dnd/campaigns/data-access';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { DndCharacterApiService } from '@ttrpg-ui/features/dnd/characters/data-access';
import { rulesSummary } from '../../rules/rules-text';
import { DndCampaignGiftComponent } from '../../members/campaign-gift.component';
import { DndCampaignInvitesComponent } from '../../members/campaign-invites.component';
import { DndCampaignMembersComponent } from '../../members/campaign-members.component';

type Campaign = DndCampaignModels.Campaigns.CampaignSchema;
type CampaignCharacter = DndCampaignModels.Campaigns.CampaignCharacter;
type CharacterIssue = DndCampaignModels.Campaigns.CharacterIssue;

/** `value()` throws while a resource is in error, so read it through this */
const valueOf = <T>(res: Resource<T | undefined>): T | undefined => (res.hasValue() ? res.value() : undefined);

/** Enough of the caller's characters to pick from (the list API pages at most this many) */
const MY_CHARACTERS_LIMIT = 200;

/**
 * A campaign: its description, its rules in words, and its characters with what breaks the rules.
 * The DM approves an issue as an exception (or takes it back), adds one of their characters (the
 * API refuses one that breaks the rules, listing why), or removes one (it goes back to its own rules).
 */
@Component({
  selector: 'lib-page-dnd-campaigns-view',
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressBarModule,
    SharedFormsSingleSelectComponent,
    DndCampaignGiftComponent,
    DndCampaignInvitesComponent,
    DndCampaignMembersComponent,
  ],
  templateUrl: './page-dnd-campaigns-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDndCampaignsViewComponent {
  private readonly router = inject(Router);

  private readonly api = inject(DndCampaignApiService);

  private readonly characterApi = inject(DndCharacterApiService);

  protected readonly store = inject(DndCampaignsStore);

  /** Route resource (`campaignRouteResources`) */
  readonly campaign = input.required<Resource<Campaign | undefined>>();

  /** Keeps the last campaign on screen while the next one loads */
  protected readonly shown = linkedSignal<Campaign | undefined, Campaign | undefined>({
    source: () => valueOf(this.campaign()),
    computation: (value, previous) => value ?? previous?.value,
  });

  protected readonly rules = computed(() => {
    const campaign = this.shown();
    return campaign ? rulesSummary(campaign.rules) : [];
  });

  protected readonly characterRoute = DndCharacterModels.Characters.characterRoute;

  /** Bumped after each change to the campaign's members or characters */
  private readonly version = signal(0);

  protected readonly people = rxResource({
    params: () => {
      const id = this.shown()?.id;
      return id ? { id, version: this.version() } : undefined;
    },
    stream: ({ params }) => this.api.getMembers(params.id),
  });

  /** The caller's user id, from their own member row */
  protected readonly myId = computed(() =>
    this.people.hasValue() ? (this.people.value().entities.find((m) => m.me)?.user_id ?? null) : null,
  );

  protected readonly isDM = computed(() => this.shown()?.role === 'dm');

  protected readonly isOwner = computed(() => !!this.myId() && this.shown()?.owner_id === this.myId());

  protected readonly canInvite = computed(() => this.isDM() || this.shown()?.settings.access.invite === 'members');

  /** The character the gift form is open for */
  protected readonly giving = signal<string | null>(null);

  protected readonly notice = signal<string | null>(null);

  protected readonly party = rxResource({
    params: () => {
      const id = this.shown()?.id;
      return id ? { id, version: this.version() } : undefined;
    },
    stream: ({ params }) => this.api.getCharacters(params.id),
  });

  /** The caller's characters that aren't in a campaign, to add */
  protected readonly free = rxResource({
    params: () => ({ version: this.version() }),
    stream: () => this.characterApi.getList({ limit: MY_CHARACTERS_LIMIT, offset: 0, sort: null, filters: {} }),
  });

  /** The caller's own characters in no campaign (not the ones they only edit) */
  protected readonly freeCharacters = computed(() =>
    this.free.hasValue() ? this.free.value().entities.filter((c) => !c.campaign_id && c.viewer?.owner !== false) : [],
  );

  protected readonly picked = signal<string | null>(null);

  protected readonly saving = signal(false);

  protected readonly error = signal<string | null>(null);

  /** Why the API refused to add a character: what breaks the rules */
  protected readonly refused = signal<CharacterIssue[]>([]);

  protected readonly errorMessage = computed(() => {
    const error = this.campaign().error();
    if (!error) return null;
    return error instanceof HttpErrorResponse && error.status === 404 ? 'Campaign not found.' : getErrorMessage(error);
  });

  constructor() {
    pageMeta(() => {
      const campaign = this.shown();
      return {
        title: [campaign?.name ?? 'Campaign', 'Campaigns'],
        description: campaign ? `${campaign.name}, a campaign.` : 'View a campaign.',
      };
    });
  }

  refresh(): void {
    this.version.update((v) => v + 1);
  }

  /** Left the campaign: it's no longer theirs to see */
  onLeft(): void {
    this.router.navigate(['/', 'dnd', 'campaigns']);
  }

  onGiven(c: CampaignCharacter): void {
    this.giving.set(null);
    this.notice.set(`Given to ${c.name}.`);
  }

  onAdd(campaign: Campaign): void {
    const characterId = this.picked();
    if (!characterId) return;
    this.run(this.api.addCharacter(campaign.id, characterId), () => this.picked.set(null));
  }

  onRemove(campaign: Campaign, c: CampaignCharacter): void {
    if (!confirm(`Take ${c.name} out of ${campaign.name}? It goes back to its own rules.`)) return;
    this.run(this.api.removeCharacter(campaign.id, c.id));
  }

  onApprove(campaign: Campaign, c: CampaignCharacter, issue: CharacterIssue): void {
    this.run(this.api.approveException(campaign.id, c.id, issue.id));
  }

  onRevoke(campaign: Campaign, c: CampaignCharacter, issue: CharacterIssue): void {
    this.run(this.api.revokeException(campaign.id, c.id, issue.id));
  }

  onDeleteClicked(campaign: Campaign): void {
    if (!confirm(`Delete ${campaign.name}?`)) return;
    this.store.delete({ entity: campaign, onDeleted: () => this.router.navigate(['/', 'dnd', 'campaigns']) });
  }

  private run(write: Observable<unknown>, done?: () => void): void {
    this.saving.set(true);
    this.error.set(null);
    this.notice.set(null);
    this.refused.set([]);
    write.subscribe({
      next: () => {
        this.saving.set(false);
        done?.();
        this.version.update((v) => v + 1);
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.error.set(getErrorMessage(error));
        const issues = error instanceof HttpErrorResponse ? error.error?.issues : undefined;
        this.refused.set(Array.isArray(issues) ? issues : []);
      },
    });
  }
}
