import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { pageMeta } from '@ttrpg-ui/shared/core/util';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { SharedPaginatorComponent } from '@ttrpg-ui/shared/pagination/ui';
import { TableModels } from '@ttrpg-ui/shared/table/models';
import { SharedAngularMaterialTableComponent } from '@ttrpg-ui/shared/table/ui';
import { reconcileLayout, toSavedLayout } from '@ttrpg-ui/shared/table/util';
import { titleWords } from '@ttrpg-ui/shared/util';
import { DndItemModels } from '@ttrpg-ui/features/dnd/items/models';
import { DndItemsStore } from '@ttrpg-ui/features/dnd/items/data-access';

type Item = DndItemModels.Items.ItemSchema;
type Column = TableModels.ColumnDef<Item>;

/** Where the user's column order, widths and hidden columns are saved */
const LAYOUT_KEY = 'PageDndItemsViewAllComponent.columnDefs';

// one column per field the API returns; `filter: true` picks the filter from cellDataType, and a
// column the API can't sort or filter on says `sortable: false` and leaves `filter` out.
// Each field here must be in the API service's LIST_FIELDS, or its cells come back empty.
const DEFAULT_COLUMN_DEFS: Column[] = [
  { field: 'id', headerName: 'ID', cellDataType: 'text', sortable: false, pinned: 'left', hide: true },
  { field: 'name', headerName: 'Name', cellDataType: 'text', sortable: true, filter: true, pinned: 'left' },
  { field: 'slug', headerName: 'Slug', cellDataType: 'text', sortable: true, filter: true, hide: true },
  {
    field: 'source',
    headerName: 'Source',
    headerTooltip: 'The book it is printed in',
    cellDataType: 'text',
    // the value stays the source object; the cell shows "PHB (2024)"
    valueFormatter: ({ value, data }) => `${(value as Item['source']).name_short} (${data.dnd_version_year})`,
    sortable: false,
  },
  {
    field: 'dnd_version_year',
    headerName: 'Edition',
    cellDataType: 'date',
    dateFormat: 'y',
    // mid-year so a timezone shift can't roll it into the previous year
    valueGetter: (item: Item) => new Date(item.dnd_version_year, 6, 1),
    sortable: true,
    filter: 'agDateColumnFilter',
    filterParams: { appGranularity: 'year', filterOptions: ['equals', 'inRange'] },
  },
  {
    field: 'is_unearthed_arcana',
    headerName: 'Is UA',
    headerTooltip: 'Unearthed Arcana (playtest material)',
    cellDataType: 'boolean',
    sortable: true,
    filter: true,
    hide: true,
  },
  {
    field: 'is_homebrew',
    headerName: 'Is Homebrew',
    cellDataType: 'boolean',
    sortable: true,
    filter: true,
    hide: true,
  },
  {
    field: 'category',
    headerName: 'Category',
    cellDataType: 'text',
    valueFormatter: ({ value }) => (value ? titleWords(value) : ''),
    sortable: true,
    filter: 'appSetColumnFilter',
    filterParams: {
      values: [...DndItemModels.Items.ITEM_CATEGORIES, null],
      valueFormatter: ({ value }) => (value ? titleWords(value) : 'None'),
    },
  },
  // the data spells these several ways ("Artisan Tool", "Artisan's tools"), so no filter yet
  { field: 'subcategory', headerName: 'Subcategory', cellDataType: 'text', sortable: true },
  { field: 'is_magic', headerName: 'Is Magic', cellDataType: 'boolean', sortable: true, filter: true },
  {
    field: 'rarity',
    headerName: 'Rarity',
    cellDataType: 'text',
    valueFormatter: ({ value }) => (value ? titleWords(value) : ''),
    sortable: true,
    filter: 'appSetColumnFilter',
    filterParams: {
      values: [...DndItemModels.Items.ITEM_RARITIES, null],
      valueFormatter: ({ value }) => (value ? titleWords(value) : 'None'),
    },
  },
  { field: 'requires_attunement', headerName: 'Attunement', cellDataType: 'boolean', sortable: true, filter: true },
  // as printed, so the API can't sort or filter on them
  { field: 'cost', headerName: 'Cost', cellDataType: 'text', sortable: false },
  { field: 'weight', headerName: 'Weight', cellDataType: 'text', sortable: false },
  { field: 'magic_item_type', headerName: 'Magic Item Type', cellDataType: 'text', sortable: true, hide: true },
];

@Component({
  selector: 'lib-page-dnd-items-view-all',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    SharedAngularMaterialTableComponent,
    SharedPaginatorComponent,
  ],
  templateUrl: './page-dnd-items-view-all.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // fills the page height so the table scrolls inside; 30rem floor for short screens
  host: { class: 'flex min-h-120 flex-1 flex-col gap-2' },
})
export class PageDndItemsViewAllComponent {
  private readonly router = inject(Router);

  private readonly localStorage = inject(SharedLocalStorageService);

  protected readonly store = inject(DndItemsStore);

  protected columnDefs: Column[] = reconcileLayout(this.localStorage.get(LAYOUT_KEY), DEFAULT_COLUMN_DEFS);

  constructor() {
    pageMeta(() => ({ title: ['D&D Items'], description: 'A list of D&D items.' }));
  }

  onColumnDefsChange(columnDefs: Column[]): void {
    this.localStorage.set(LAYOUT_KEY, toSavedLayout(columnDefs));
  }

  onResetColumnDefsClicked(): void {
    this.columnDefs = [...DEFAULT_COLUMN_DEFS];
    this.localStorage.remove(LAYOUT_KEY);
  }

  onRowDoubleClicked(item: Item): void {
    this.router.navigate(DndItemModels.Items.itemRoute(item));
  }
}
