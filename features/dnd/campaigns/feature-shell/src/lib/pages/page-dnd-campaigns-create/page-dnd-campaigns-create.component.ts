import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { pageMeta } from '@ttrpg-ui/shared/core/util';
import { DndCampaignModels } from '@ttrpg-ui/features/dnd/campaigns/models';
import { DndCampaignApiService, DndCampaignsStore } from '@ttrpg-ui/features/dnd/campaigns/data-access';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { DndCampaignRulesFormComponent } from '../../rules/rules-form.component';

type Rules = DndCharacterModels.Rules.Rules;

/** A new campaign: its name, description and rules (starting from the API's defaults). The caller is its DM. */
@Component({
  selector: 'lib-page-dnd-campaigns-create',
  imports: [
    RouterLink,
    TextFieldModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    DndCampaignRulesFormComponent,
  ],
  templateUrl: './page-dnd-campaigns-create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDndCampaignsCreateComponent {
  private readonly router = inject(Router);

  private readonly api = inject(DndCampaignApiService);

  protected readonly store = inject(DndCampaignsStore);

  protected readonly name = signal('');

  protected readonly description = signal('');

  protected readonly defaults = rxResource({ stream: () => this.api.getDefaultRules() });

  /** The defaults until changed */
  protected readonly rules = linkedSignal<Rules | undefined>(() =>
    this.defaults.hasValue() ? this.defaults.value() : undefined,
  );

  private readonly submitted = signal(false);

  protected readonly errorMessage = computed(() => (this.submitted() ? this.store.error() : null));

  constructor() {
    pageMeta(() => ({ title: ['Create Campaign', 'Campaigns'], description: 'Create a campaign.' }));
  }

  onSubmit(): void {
    const name = this.name().trim();
    if (!name) return;
    this.submitted.set(true);
    this.store.create({
      body: { name, description: this.description().trim(), rules: this.rules() },
      onCreated: (campaign) => this.router.navigate(DndCampaignModels.Campaigns.campaignRoute(campaign)),
    });
  }
}
