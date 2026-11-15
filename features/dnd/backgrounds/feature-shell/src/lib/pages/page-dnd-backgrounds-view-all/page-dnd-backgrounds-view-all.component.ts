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
import { DndBackgroundModels } from '@ttrpg-ui/features/dnd/backgrounds/models';
import { DndBackgroundsStore } from '@ttrpg-ui/features/dnd/backgrounds/data-access';

type Background = DndBackgroundModels.Backgrounds.BackgroundSchema;
type Column = TableModels.ColumnDef<Background>;

/** Where the user's column order, widths and hidden columns are saved */
const LAYOUT_KEY = 'PageDndBackgroundsViewAllComponent.columnDefs';

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
    valueFormatter: ({ value, data }) => `${(value as Background['source']).name_short} (${data.dnd_version_year})`,
    sortable: false,
  },
  {
    field: 'dnd_version_year',
    headerName: 'Edition',
    cellDataType: 'date',
    dateFormat: 'y',
    // mid-year so a timezone shift can't roll it into the previous year
    valueGetter: (background: Background) => new Date(background.dnd_version_year, 6, 1),
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
    field: 'ability_score_bonuses',
    headerName: 'Ability Scores',
    headerTooltip: 'The three abilities it can raise (2024)',
    cellDataType: 'text',
    sortable: true,
    filter: true,
  },
  {
    field: 'feat',
    headerName: 'Feat',
    headerTooltip: 'The origin feat it grants (2024)',
    cellDataType: 'text',
    sortable: true,
    filter: true,
  },
  // lists: the API can't sort or filter on them
  {
    field: 'skill_proficiencies',
    headerName: 'Skills',
    cellDataType: 'text',
    valueFormatter: ({ value }) => value.join(', '),
    sortable: false,
  },
  {
    field: 'tool_proficiencies',
    headerName: 'Tools',
    cellDataType: 'text',
    valueFormatter: ({ value }) => value.join(', '),
    sortable: false,
  },
];

@Component({
  selector: 'lib-page-dnd-backgrounds-view-all',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    SharedAngularMaterialTableComponent,
    SharedPaginatorComponent,
  ],
  templateUrl: './page-dnd-backgrounds-view-all.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // fills the page height so the table scrolls inside; 30rem floor for short screens
  host: { class: 'flex min-h-120 flex-1 flex-col gap-2' },
})
export class PageDndBackgroundsViewAllComponent {
  private readonly router = inject(Router);

  private readonly localStorage = inject(SharedLocalStorageService);

  protected readonly store = inject(DndBackgroundsStore);

  protected columnDefs: Column[] = reconcileLayout(this.localStorage.get(LAYOUT_KEY), DEFAULT_COLUMN_DEFS);

  constructor() {
    pageMeta(() => ({ title: ['D&D Backgrounds'], description: 'A list of D&D backgrounds.' }));
  }

  onColumnDefsChange(columnDefs: Column[]): void {
    this.localStorage.set(LAYOUT_KEY, toSavedLayout(columnDefs));
  }

  onResetColumnDefsClicked(): void {
    this.columnDefs = [...DEFAULT_COLUMN_DEFS];
    this.localStorage.remove(LAYOUT_KEY);
  }

  onRowDoubleClicked(background: Background): void {
    this.router.navigate(DndBackgroundModels.Backgrounds.backgroundRoute(background));
  }
}
