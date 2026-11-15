import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { pageMeta } from '@ttrpg-ui/shared/core/util';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { SharedPaginatorComponent } from '@ttrpg-ui/shared/pagination/ui';
import { getErrorMessage } from '@ttrpg-ui/shared/store/util';
import { TableModels } from '@ttrpg-ui/shared/table/models';
import { SharedAngularMaterialTableComponent } from '@ttrpg-ui/shared/table/ui';
import { reconcileLayout, toSavedLayout } from '@ttrpg-ui/shared/table/util';
import { titleWords } from '@ttrpg-ui/shared/util';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { DndCharacterApiService, DndCharactersStore } from '@ttrpg-ui/features/dnd/characters/data-access';

type Character = DndCharacterModels.Characters.CharacterSchema;
type IncomingTransfer = DndCharacterModels.Characters.IncomingTransfer;
type Column = TableModels.ColumnDef<Character>;

/** Where the user's column order, widths and hidden columns are saved */
const LAYOUT_KEY = 'PageDndCharactersViewAllComponent.columnDefs';

// the list comes back by name, and the API takes no sort or filters for it yet
const DEFAULT_COLUMN_DEFS: Column[] = [
  { field: 'id', headerName: 'ID', cellDataType: 'text', sortable: false, pinned: 'left', hide: true },
  { field: 'name', headerName: 'Name', cellDataType: 'text', sortable: false, pinned: 'left' },
  { field: 'current_level', headerName: 'Level', cellDataType: 'number', sortable: false },
  {
    field: 'viewer',
    headerName: 'Yours',
    headerTooltip: 'Yours, or one its owner lets you edit',
    cellDataType: 'text',
    valueFormatter: ({ value }) => (value?.editor ? 'Editor' : 'Owner'),
    sortable: false,
  },
  {
    field: 'rules_from',
    headerName: 'Rules',
    headerTooltip: "A campaign's rules, or the character's own",
    cellDataType: 'text',
    valueFormatter: ({ value }) => (value === 'campaign' ? 'Campaign' : 'Own'),
    sortable: false,
  },
  {
    field: 'ability_method',
    headerName: 'Ability Scores',
    cellDataType: 'text',
    valueFormatter: ({ value }) => titleWords(value ?? ''),
    sortable: false,
  },
  { field: 'updated_at', headerName: 'Updated', cellDataType: 'date', sortable: false },
];

@Component({
  selector: 'lib-page-dnd-characters-view-all',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    SharedAngularMaterialTableComponent,
    SharedPaginatorComponent,
  ],
  templateUrl: './page-dnd-characters-view-all.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // fills the page height so the table scrolls inside; 30rem floor for short screens
  host: { class: 'flex min-h-120 flex-1 flex-col gap-2' },
})
export class PageDndCharactersViewAllComponent {
  private readonly router = inject(Router);

  private readonly localStorage = inject(SharedLocalStorageService);

  private readonly api = inject(DndCharacterApiService);

  protected readonly store = inject(DndCharactersStore);

  protected columnDefs: Column[] = reconcileLayout(this.localStorage.get(LAYOUT_KEY), DEFAULT_COLUMN_DEFS);

  /** Characters their owners offered to the caller */
  protected readonly offers = rxResource({ stream: () => this.api.getIncomingTransfers() });

  protected readonly answering = signal(false);

  protected readonly offerError = signal<string | null>(null);

  constructor() {
    pageMeta(() => ({ title: ['Characters'], description: 'A list of characters.' }));
  }

  onAccept(offer: IncomingTransfer): void {
    this.answering.set(true);
    this.offerError.set(null);
    this.api.acceptTransfer(offer.character_id).subscribe({
      next: (character) => this.router.navigate(DndCharacterModels.Characters.characterRoute(character)),
      error: (error: unknown) => {
        this.answering.set(false);
        this.offerError.set(getErrorMessage(error));
      },
    });
  }

  onDecline(offer: IncomingTransfer): void {
    this.answering.set(true);
    this.offerError.set(null);
    this.api.declineTransfer(offer.character_id).subscribe({
      next: (left) => {
        this.answering.set(false);
        this.offers.set(left);
      },
      error: (error: unknown) => {
        this.answering.set(false);
        this.offerError.set(getErrorMessage(error));
      },
    });
  }

  onColumnDefsChange(columnDefs: Column[]): void {
    this.localStorage.set(LAYOUT_KEY, toSavedLayout(columnDefs));
  }

  onResetColumnDefsClicked(): void {
    this.columnDefs = [...DEFAULT_COLUMN_DEFS];
    this.localStorage.remove(LAYOUT_KEY);
  }

  onRowDoubleClicked(character: Character): void {
    this.router.navigate(DndCharacterModels.Characters.characterRoute(character));
  }
}
