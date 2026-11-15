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
import { Router, RouterLink } from '@angular/router';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { pageMeta } from '@ttrpg-ui/shared/core/util';
import { getErrorMessage } from '@ttrpg-ui/shared/store/util';
import { DndCampaignModels } from '@ttrpg-ui/features/dnd/campaigns/models';
import { DndCampaignApiService, DndCampaignsStore } from '@ttrpg-ui/features/dnd/campaigns/data-access';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { DndCampaignRulesFormComponent } from '../../rules/rules-form.component';

type Campaign = DndCampaignModels.Campaigns.CampaignSchema;
type CampaignCharacter = DndCampaignModels.Campaigns.CampaignCharacter;
type Rules = DndCharacterModels.Rules.Rules;

/** `value()` throws while a resource is in error, so read it through this */
const valueOf = <T>(res: Resource<T | undefined>): T | undefined => (res.hasValue() ? res.value() : undefined);

/**
 * A campaign's name, description and rules. Save first asks the API what the new rules would flag;
 * when a character would break them, it lists them and waits for "Save anyway". Tightening keeps every
 * existing pick: each one becomes a warning the DM can approve or the player can fix.
 */
@Component({
  selector: 'lib-page-dnd-campaigns-edit',
  imports: [
    RouterLink,
    TextFieldModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    DndCampaignRulesFormComponent,
  ],
  templateUrl: './page-dnd-campaigns-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDndCampaignsEditComponent {
  private readonly router = inject(Router);

  private readonly api = inject(DndCampaignApiService);

  protected readonly store = inject(DndCampaignsStore);

  /** Route resource (`campaignRouteResources`) */
  readonly campaign = input.required<Resource<Campaign | undefined>>();

  protected readonly loaded = computed(() => valueOf(this.campaign()));

  protected readonly viewRoute = DndCampaignModels.Campaigns.campaignRoute;

  protected readonly name = linkedSignal(() => this.loaded()?.name ?? '');

  protected readonly description = linkedSignal(() => this.loaded()?.description ?? '');

  protected readonly rules = linkedSignal<Rules | undefined>(() => this.loaded()?.rules);

  protected readonly invite = linkedSignal<DndCampaignModels.Campaigns.InviteSetting>(
    () => this.loaded()?.settings.access.invite ?? 'dms',
  );

  protected readonly partySheets = linkedSignal<DndCampaignModels.Campaigns.PartySheetsSetting>(
    () => this.loaded()?.settings.access.party_sheets ?? 'summary',
  );

  /** The rules last checked (as JSON) and the characters with unapproved issues under them */
  private readonly checked = signal<{ rules: string; flagged: CampaignCharacter[] } | null>(null);

  /** What the checked rules flag, while they're still the ones in the form */
  protected readonly flagged = computed(() => {
    const checked = this.checked();
    return checked && checked.rules === JSON.stringify(this.rules()) ? checked.flagged : null;
  });

  protected readonly checking = signal(false);

  private readonly checkError = signal<string | null>(null);

  private readonly submitted = signal(false);

  protected readonly loadError = computed(() => {
    const error = this.campaign().error();
    if (!error) return null;
    return error instanceof HttpErrorResponse && error.status === 404 ? 'Campaign not found.' : getErrorMessage(error);
  });

  protected readonly errorMessage = computed(() => this.checkError() ?? (this.submitted() ? this.store.error() : null));

  constructor() {
    pageMeta(() => ({
      title: [`Edit ${this.loaded()?.name ?? 'Campaign'}`, 'Campaigns'],
      description: 'Edit a campaign.',
    }));
  }

  protected unapproved(c: CampaignCharacter): string[] {
    return c.issues.filter((i) => !i.approved).map((i) => `${i.name} (${i.category}): ${i.reason}`);
  }

  /** Checks the rules first; saves when nothing new is flagged, or when the check was already shown */
  onSubmit(campaign: Campaign): void {
    const rules = this.rules();
    if (!this.name().trim() || !rules) return;
    if (this.flagged()) {
      this.save(campaign, rules);
      return;
    }
    this.checking.set(true);
    this.checkError.set(null);
    this.api.previewRules(campaign.id, rules).subscribe({
      next: (list) => {
        this.checking.set(false);
        const flagged = list.entities.filter((c) => c.issues.some((i) => !i.approved));
        this.checked.set({ rules: JSON.stringify(rules), flagged });
        if (!flagged.length) this.save(campaign, rules);
      },
      error: (error: unknown) => {
        this.checking.set(false);
        this.checkError.set(getErrorMessage(error));
      },
    });
  }

  private save(campaign: Campaign, rules: Rules): void {
    this.submitted.set(true);
    this.store.update({
      id: campaign.id,
      body: {
        name: this.name().trim(),
        description: this.description().trim(),
        rules,
        settings: { access: { invite: this.invite(), party_sheets: this.partySheets() } },
      },
      onUpdated: (updated) => this.router.navigate(DndCampaignModels.Campaigns.campaignRoute(updated)),
    });
  }
}
