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
import { DndSubclassModels } from '@ttrpg-ui/features/dnd/subclasses/models';
import { DndSubclassesStore } from '@ttrpg-ui/features/dnd/subclasses/data-access';

type Subclass = DndSubclassModels.Subclasses.SubclassSchema;
type Column = TableModels.ColumnDef<Subclass>;

/** The class filter's values: the classes in the data. A new class needs adding here. */
const PARENT_CLASS_SLUGS = [
  'artificer',
  'barbarian',
  'bard',
  'blood-hunter',
  'cleric',
  'druid',
  'fighter',
  'monk',
  'paladin',
  'ranger',
  'rogue',
  'sorcerer',
  'warlock',
  'wizard',
];

/** Where the user's column order, widths and hidden columns are saved */
const LAYOUT_KEY = 'PageDndSubclassesViewAllComponent.columnDefs';

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
    valueFormatter: ({ value, data }) => `${(value as Subclass['source']).name_short} (${data.dnd_version_year})`,
    sortable: false,
  },
  {
    field: 'dnd_version_year',
    headerName: 'Edition',
    cellDataType: 'date',
    dateFormat: 'y',
    // mid-year so a timezone shift can't roll it into the previous year
    valueGetter: (subclass: Subclass) => new Date(subclass.dnd_version_year, 6, 1),
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
    field: 'parent_class_slug',
    headerName: 'Class',
    cellDataType: 'text',
    valueFormatter: ({ value }) => titleWords(value),
    sortable: true,
    filter: 'appSetColumnFilter',
    filterParams: { values: [...PARENT_CLASS_SLUGS], valueFormatter: ({ value }) => titleWords(value ?? '') },
  },
  {
    field: 'level_gained',
    headerName: 'Level Gained',
    headerTooltip: 'The class level it is chosen at',
    cellDataType: 'number',
    sortable: true,
    filter: true,
    filterParams: { appMin: 1, appMax: 20, appIntegerOnly: true },
  },
  {
    field: 'spellcasting_ability',
    headerName: 'Spellcasting',
    headerTooltip: "The ability it casts with, for a subclass that casts on its own (the class's casting isn't here)",
    cellDataType: 'text',
    valueFormatter: ({ value }) => (value ? value.toUpperCase() : ''),
    sortable: true,
    filter: 'appSetColumnFilter',
    filterParams: {
      values: [...DndClassModels.Classes.SPELLCASTING_ABILITIES, null],
      valueFormatter: ({ value }) => (value ? value.toUpperCase() : 'None'),
    },
    hide: true,
  },
  {
    field: 'caster_progression',
    headerName: 'Caster Progression',
    cellDataType: 'text',
    valueFormatter: ({ value }) => (value ? titleWords(value) : ''),
    sortable: true,
    filter: 'appSetColumnFilter',
    filterParams: {
      values: [...DndClassModels.Classes.CASTER_PROGRESSIONS, null],
      valueFormatter: ({ value }) => (value ? titleWords(value) : 'None'),
    },
    hide: true,
  },
];

@Component({
  selector: 'lib-page-dnd-subclasses-view-all',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    SharedAngularMaterialTableComponent,
    SharedPaginatorComponent,
  ],
  templateUrl: './page-dnd-subclasses-view-all.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // fills the page height so the table scrolls inside; 30rem floor for short screens
  host: { class: 'flex min-h-120 flex-1 flex-col gap-2' },
})
export class PageDndSubclassesViewAllComponent {
  private readonly router = inject(Router);

  private readonly localStorage = inject(SharedLocalStorageService);

  protected readonly store = inject(DndSubclassesStore);

  protected columnDefs: Column[] = reconcileLayout(this.localStorage.get(LAYOUT_KEY), DEFAULT_COLUMN_DEFS);

  constructor() {
    pageMeta(() => ({ title: ['D&D Subclasses'], description: 'A list of D&D subclasses.' }));
  }

  onColumnDefsChange(columnDefs: Column[]): void {
    this.localStorage.set(LAYOUT_KEY, toSavedLayout(columnDefs));
  }

  onResetColumnDefsClicked(): void {
    this.columnDefs = [...DEFAULT_COLUMN_DEFS];
    this.localStorage.remove(LAYOUT_KEY);
  }

  onRowDoubleClicked(subclass: Subclass): void {
    this.router.navigate(DndSubclassModels.Subclasses.subclassRoute(subclass));
  }
}
