import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Observable, of } from 'rxjs';
import { getErrorMessage } from '@ttrpg-ui/shared/store/util';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { DndCharacterApiService } from '@ttrpg-ui/features/dnd/characters/data-access';

type Character = DndCharacterModels.Characters.CharacterDetail;
type Item = DndCharacterModels.Characters.CharacterItem;
type CatalogItem = DndCharacterModels.Characters.CatalogItemRef;

type Currency = DndCharacterModels.Characters.Currency;

const COINS: DndCharacterModels.Characters.Coin[] = ['pp', 'gp', 'ep', 'sp', 'cp'];

const fullCurrency = (c: Partial<Currency> | undefined): Currency =>
  Object.fromEntries(COINS.map((coin) => [coin, c?.[coin] ?? 0])) as Currency;

/**
 * The character's items and coins: add from the catalog or by name, change the quantity, equip,
 * remove; edit the coins. Items from a starting equipment pick say so; changing that pick takes back the untouched
 * ones. A DM's gift says so, and that campaign's DMs can take it back while nobody has changed it.
 * Only the owner and editors change the rest (`viewer.can_edit`). Each write sends the version shown
 * (If-Match); `changed` asks the page to reload.
 */
@Component({
  selector: 'lib-dnd-inventory',
  imports: [
    UpperCasePipe,
    MatAutocompleteModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DndInventoryComponent {
  private readonly api = inject(DndCharacterApiService);

  readonly character = input.required<Character>();

  readonly changed = output<void>();

  protected readonly saving = signal(false);

  protected readonly error = signal<string | null>(null);

  protected readonly search = signal('');

  /** The owner and editors (an API without `viewer` predates sharing: the caller owns it) */
  protected readonly canEdit = computed(() => this.character().viewer?.can_edit ?? true);

  /** The caller is a DM of the campaign the character is in now */
  private readonly campaignDM = computed(() => !!this.character().viewer?.can_give);

  protected readonly coins = computed(() =>
    COINS.map((coin) => ({ coin, amount: this.character().currency[coin] ?? 0 })).filter((c) => c.amount),
  );

  protected readonly allCoins = COINS;

  protected readonly editingCoins = signal(false);

  /** The coins being edited, every kind (a missing one is 0) */
  protected readonly coinDraft = signal<Currency>(fullCurrency(undefined));

  protected readonly coinsValid = computed(() =>
    COINS.every((coin) => Number.isInteger(this.coinDraft()[coin]) && this.coinDraft()[coin] >= 0),
  );

  /** The starting equipment picks, which grant items */
  private readonly equipmentPicks = computed(
    () =>
      new Set(
        this.character()
          .choices.filter((c) => c.slot.includes(':equipment'))
          .map((c) => c.id),
      ),
  );

  protected readonly matches = rxResource<CatalogItem[], string>({
    params: () => this.search().trim(),
    stream: ({ params }) => (params.length >= 2 ? this.api.searchItems(params) : of([])),
  });

  protected name(item: Item): string {
    return item.custom_name ?? item.item_name ?? '?';
  }

  protected fromStartingEquipment(item: Item): boolean {
    return !!item.granted_by_id && this.equipmentPicks().has(item.granted_by_id);
  }

  /** A DM of the giving campaign, while the character is still in it (the API also wants it unchanged) */
  protected canTakeBack(item: Item): boolean {
    return this.campaignDM() && !!item.given_by && item.given_campaign_id === this.character().campaign_id;
  }

  protected optionLabel(item: CatalogItem): string {
    return `${item.name} (${item.source_slug.replaceAll('_', ' ')}, ${item.dnd_version_year})`;
  }

  onAddCatalog(item: CatalogItem): void {
    this.search.set('');
    this.run((c) => this.api.addItem(c.id, { item_id: item.id }, c.version));
  }

  /** Not in the catalog: a custom item of that name */
  onAddCustom(): void {
    const name = this.search().trim();
    if (!name) return;
    this.search.set('');
    this.run((c) => this.api.addItem(c.id, { custom_name: name }, c.version));
  }

  onQuantity(item: Item, quantity: number): void {
    if (!Number.isInteger(quantity) || quantity < 0 || quantity === item.quantity) return;
    this.run((c) => this.api.updateItem(c.id, item.id, { quantity }, c.version));
  }

  onEquipped(item: Item, equipped: boolean): void {
    this.run((c) => this.api.updateItem(c.id, item.id, { equipped }, c.version));
  }

  onRemove(item: Item): void {
    this.run((c) => this.api.deleteItem(c.id, item.id, c.version));
  }

  onEditCoins(): void {
    this.coinDraft.set(fullCurrency(this.character().currency));
    this.editingCoins.set(true);
  }

  onCoin(coin: DndCharacterModels.Characters.Coin, amount: number): void {
    this.coinDraft.update((d) => ({ ...d, [coin]: amount }));
  }

  onSaveCoins(): void {
    if (!this.coinsValid()) return;
    const currency = this.coinDraft();
    this.editingCoins.set(false);
    this.run((c) => this.api.patch(c.id, { currency }, c.version));
  }

  private run(write: (c: Character) => Observable<Character>): void {
    this.saving.set(true);
    this.error.set(null);
    write(this.character()).subscribe({
      next: () => {
        this.saving.set(false);
        this.changed.emit();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.error.set(getErrorMessage(error));
        this.changed.emit();
      },
    });
  }
}
