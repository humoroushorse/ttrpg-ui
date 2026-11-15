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
import { DndClassModels } from '@ttrpg-ui/features/dnd/classes/models';
import { DndClassesStore } from '@ttrpg-ui/features/dnd/classes/data-access';

type Class = DndClassModels.Classes.ClassSchema;
type Column = TableModels.ColumnDef<Class>;

/** A set filter label: "INT", or "None" for blank */
const upperOrNone = ({ value }: { value: string | null }): string => (value ? value.toUpperCase() : 'None');

/** Where the user's column order, widths and hidden columns are saved */
const LAYOUT_KEY = 'PageDndClassesViewAllComponent.columnDefs';

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
    valueFormatter: ({ value, data }) => `${(value as Class['source']).name_short} (${data.dnd_version_year})`,
    sortable: false,
  },
  {
    field: 'dnd_version_year',
    headerName: 'Edition',
    cellDataType: 'date',
    dateFormat: 'y',
    // mid-year so a timezone shift can't roll it into the previous year
    valueGetter: (dndClass: Class) => new Date(dndClass.dnd_version_year, 6, 1),
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
    field: 'hit_die_size',
    headerName: 'Hit Die',
    cellDataType: 'number',
    valueFormatter: ({ value }) => (value ? `d${value}` : ''),
    sortable: true,
    filter: true,
    filterParams: { appIntegerOnly: true },
  },
  { field: 'primary_ability', headerName: 'Primary Ability', cellDataType: 'text', sortable: true, filter: true },
  {
    field: 'spellcasting_ability',
    headerName: 'Spellcasting',
    headerTooltip: "The ability it casts with; None for a class that doesn't cast",
    cellDataType: 'text',
    valueFormatter: ({ value }) => (value ? value.toUpperCase() : ''),
    sortable: true,
    filter: 'appSetColumnFilter',
    filterParams: { values: [...DndClassModels.Classes.SPELLCASTING_ABILITIES, null], valueFormatter: upperOrNone },
  },
  {
    field: 'caster_progression',
    headerName: 'Caster Progression',
    headerTooltip: 'How fast it gains spell slots; Half Up is the 2024 Paladin and Ranger',
    cellDataType: 'text',
    valueFormatter: ({ value }) => (value ? titleWords(value) : ''),
    sortable: true,
    filter: 'appSetColumnFilter',
    filterParams: {
      values: [...DndClassModels.Classes.CASTER_PROGRESSIONS, null],
      valueFormatter: ({ value }) => (value ? titleWords(value) : 'None'),
    },
  },
];

@Component({
  selector: 'lib-page-dnd-classes-view-all',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    SharedAngularMaterialTableComponent,
    SharedPaginatorComponent,
  ],
  templateUrl: './page-dnd-classes-view-all.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // fills the page height so the table scrolls inside; 30rem floor for short screens
  host: { class: 'flex min-h-120 flex-1 flex-col gap-2' },
})
export class PageDndClassesViewAllComponent {
  private readonly router = inject(Router);

  private readonly localStorage = inject(SharedLocalStorageService);

  protected readonly store = inject(DndClassesStore);

  protected columnDefs: Column[] = reconcileLayout(this.localStorage.get(LAYOUT_KEY), DEFAULT_COLUMN_DEFS);

  constructor() {
    pageMeta(() => ({ title: ['D&D Classes'], description: 'A list of D&D classes.' }));
  }

  onColumnDefsChange(columnDefs: Column[]): void {
    this.localStorage.set(LAYOUT_KEY, toSavedLayout(columnDefs));
  }

  onResetColumnDefsClicked(): void {
    this.columnDefs = [...DEFAULT_COLUMN_DEFS];
    this.localStorage.remove(LAYOUT_KEY);
  }

  onRowDoubleClicked(dndClass: Class): void {
    this.router.navigate(DndClassModels.Classes.classRoute(dndClass));
  }
}
