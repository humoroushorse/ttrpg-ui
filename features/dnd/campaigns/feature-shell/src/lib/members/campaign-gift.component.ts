import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UpperCasePipe } from '@angular/common';
import { getErrorMessage } from '@ttrpg-ui/shared/store/util';
import { SharedFormsSingleSelectComponent } from '@ttrpg-ui/shared/forms/ui';
import { DndCampaignModels } from '@ttrpg-ui/features/dnd/campaigns/models';
import { DndCampaignApiService } from '@ttrpg-ui/features/dnd/campaigns/data-access';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';

type Coin = DndCharacterModels.Characters.Coin;

const COINS: Coin[] = ['pp', 'gp', 'ep', 'sp', 'cp'];

/**
 * A DM gives one character in the campaign a custom item, coins (added to what it has) and a boon or
 * bane that adds to a number (+1 AC, −2 Strength), in one gift. A custom item's name and description
 * stay the DMs'; the boon counts only while the character is in the campaign.
 */
@Component({
  selector: 'lib-dnd-campaign-gift',
  imports: [
    UpperCasePipe,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    SharedFormsSingleSelectComponent,
  ],
  templateUrl: './campaign-gift.component.html',
  styleUrl: './campaign-gift.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DndCampaignGiftComponent {
  private readonly api = inject(DndCampaignApiService);

  readonly campaignId = input.required<string>();

  readonly character = input.required<DndCampaignModels.Campaigns.CampaignCharacter>();

  readonly given = output<void>();

  readonly closed = output<void>();

  protected readonly coins = COINS;

  protected readonly targets = DndCharacterModels.Sheet.MODIFIER_TARGETS;

  protected readonly itemName = signal('');

  protected readonly itemDescription = signal('');

  protected readonly itemQuantity = signal(1);

  protected readonly money = signal<Partial<Record<Coin, number>>>({});

  protected readonly boonLabel = signal('');

  protected readonly boonTarget = signal<string | null>(null);

  protected readonly boonAmount = signal(1);

  protected readonly saving = signal(false);

  protected readonly error = signal<string | null>(null);

  /** The gift as the API takes it; null when it's empty or a part is half filled in */
  protected readonly body = computed((): DndCampaignModels.Campaigns.CampaignGift | null => {
    const gift: DndCampaignModels.Campaigns.CampaignGift = {};
    const name = this.itemName().trim();
    if (name) {
      if (!Number.isInteger(this.itemQuantity()) || this.itemQuantity() < 1) return null;
      gift.items = [
        {
          custom_name: name,
          custom_description: this.itemDescription().trim() || undefined,
          quantity: this.itemQuantity(),
        },
      ];
    }
    const coins = Object.entries(this.money()).filter(([, n]) => n);
    if (coins.some(([, n]) => !Number.isInteger(n) || (n as number) < 0)) return null;
    if (coins.length) gift.currency = Object.fromEntries(coins);
    const label = this.boonLabel().trim();
    const target = this.boonTarget();
    if (label || target) {
      if (!label || !target || !Number.isInteger(this.boonAmount()) || !this.boonAmount()) return null;
      gift.modifiers = [{ label, target, op: 'add', value: this.boonAmount() }];
    }
    return gift.items || gift.currency || gift.modifiers ? gift : null;
  });

  onCoin(coin: Coin, amount: number): void {
    this.money.update((m) => ({ ...m, [coin]: Number.isNaN(amount) ? 0 : amount }));
  }

  onGive(): void {
    const body = this.body();
    if (!body) return;
    this.saving.set(true);
    this.error.set(null);
    this.api.give(this.campaignId(), this.character().id, body).subscribe({
      next: () => {
        this.saving.set(false);
        this.given.emit();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.error.set(getErrorMessage(error));
      },
    });
  }
}
