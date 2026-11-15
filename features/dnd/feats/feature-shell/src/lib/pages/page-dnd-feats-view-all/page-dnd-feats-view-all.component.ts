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
import { DndFeatModels } from '@ttrpg-ui/features/dnd/feats/models';
import { DndFeatsStore } from '@ttrpg-ui/features/dnd/feats/data-access';

type Feat = DndFeatModels.Feats.FeatSchema;
type Column = TableModels.ColumnDef<Feat>;

/** Where the user's column order, widths and hidden columns are saved */
const LAYOUT_KEY = 'PageDndFeatsViewAllComponent.columnDefs';

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
    valueFormatter: ({ value, data }) => `${(value as Feat['source']).name_short} (${data.dnd_version_year})`,
    sortable: false,
  },
  {
    field: 'dnd_version_year',
    headerName: 'Edition',
    cellDataType: 'date',
    dateFormat: 'y',
    // mid-year so a timezone shift can't roll it into the previous year
    valueGetter: (feat: Feat) => new Date(feat.dnd_version_year, 6, 1),
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
    sortable: true,
    filter: 'appSetColumnFilter',
    filterParams: {
      values: [...DndFeatModels.Feats.FEAT_CATEGORIES, null],
      valueFormatter: ({ value }) => value ?? 'None',
    },
  },
  {
    field: 'prerequisites',
    headerName: 'Prerequisite',
    cellDataType: 'text',
    // the value stays the object; the cell shows its printed text
    valueFormatter: ({ value }) => (value as Feat['prerequisites'])?.text ?? '',
    sortable: false,
  },
];

@Component({
  selector: 'lib-page-dnd-feats-view-all',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    SharedAngularMaterialTableComponent,
    SharedPaginatorComponent,
  ],
  templateUrl: './page-dnd-feats-view-all.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // fills the page height so the table scrolls inside; 30rem floor for short screens
  host: { class: 'flex min-h-120 flex-1 flex-col gap-2' },
})
export class PageDndFeatsViewAllComponent {
  private readonly router = inject(Router);

  private readonly localStorage = inject(SharedLocalStorageService);

  protected readonly store = inject(DndFeatsStore);

  protected columnDefs: Column[] = reconcileLayout(this.localStorage.get(LAYOUT_KEY), DEFAULT_COLUMN_DEFS);

  constructor() {
    pageMeta(() => ({ title: ['D&D Feats'], description: 'A list of D&D feats.' }));
  }

  onColumnDefsChange(columnDefs: Column[]): void {
    this.localStorage.set(LAYOUT_KEY, toSavedLayout(columnDefs));
  }

  onResetColumnDefsClicked(): void {
    this.columnDefs = [...DEFAULT_COLUMN_DEFS];
    this.localStorage.remove(LAYOUT_KEY);
  }

  onRowDoubleClicked(feat: Feat): void {
    this.router.navigate(DndFeatModels.Feats.featRoute(feat));
  }
}
