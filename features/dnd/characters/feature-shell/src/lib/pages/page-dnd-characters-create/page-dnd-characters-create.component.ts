import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { pageMeta } from '@ttrpg-ui/shared/core/util';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { DndCharactersStore } from '@ttrpg-ui/features/dnd/characters/data-access';
import { DndCampaignApiService } from '@ttrpg-ui/features/dnd/campaigns/data-access';

/** Enough of the caller's campaigns to pick from */
const CAMPAIGNS_LIMIT = 100;

/**
 * A new character: its name, and optionally a campaign (which supplies the rules). It starts at
 * level 1 with the rules' default (point buy, all 8s) and no class; the sheet then lists every
 * choice it needs.
 */
@Component({
  selector: 'lib-page-dnd-characters-create',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './page-dnd-characters-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDndCharactersCreateComponent {
  private readonly router = inject(Router);

  private readonly campaignApi = inject(DndCampaignApiService);

  protected readonly store = inject(DndCharactersStore);

  /** The `?campaign=` query param: a campaign page's "new character for this campaign" */
  readonly campaign = input<string>();

  protected readonly name = signal('');

  protected readonly campaignId = linkedSignal<string | null>(() => this.campaign() ?? null);

  protected readonly campaigns = rxResource({
    stream: () => this.campaignApi.getList({ limit: CAMPAIGNS_LIMIT, offset: 0, sort: null, filters: {} }),
  });

  private readonly submitted = signal(false);

  protected readonly canSubmit = computed(() => this.name().trim().length > 0 && !this.store.loading());

  /** The API's problem, once the user has submitted */
  protected readonly errorMessage = computed(() => (this.submitted() ? this.store.error() : null));

  constructor() {
    pageMeta(() => ({ title: ['Create Character', 'Characters'], description: 'Create a character.' }));
  }

  onSubmit(): void {
    if (!this.canSubmit()) return;
    this.submitted.set(true);
    this.store.create({
      body: { name: this.name().trim(), campaign_id: this.campaignId() },
      onCreated: (character) => this.router.navigate(DndCharacterModels.Characters.characterRoute(character)),
    });
  }
}
