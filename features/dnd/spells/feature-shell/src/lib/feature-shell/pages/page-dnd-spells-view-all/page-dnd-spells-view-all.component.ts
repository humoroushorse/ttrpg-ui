import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedAngularMaterialTableComponent } from '@ttrpg-ui/shared/table/ui';
import { TableModels } from '@ttrpg-ui/shared/table/models';
import { reconcileLayout, toSavedLayout } from '@ttrpg-ui/shared/table/util';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { SharedPaginatorComponent } from '@ttrpg-ui/shared/pagination/ui';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserAvatarListComponent } from '@ttrpg-ui/features/user/ui';
import { Meta, Title } from '@angular/platform-browser';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { DndSpellModels } from '@ttrpg-ui/features/dnd/spells/models';
import { DndSpellApiService, SpellsStore } from '@ttrpg-ui/features/dnd/spells/data-access';
import { DndSpellTableActionsComponent } from '@ttrpg-ui/features/dnd/spells/ui';
import { Router } from '@angular/router';

type Spell = DndSpellModels.Spells.SpellSchema;
type Column = TableModels.ColumnDef<Spell>;

const DAMAGE_TYPES = [
  'acid',
  'bludgeoning',
  'cold',
  'fire',
  'force',
  'lightning',
  'necrotic',
  'piercing',
  'poison',
  'psychic',
  'radiant',
  'slashing',
  'thunder',
];

const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

/** A set filter label: "Evocation", or "None" for blank */
const label = ({ value }: { value: string | null }): string =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : 'None';

@Component({
  selector: 'lib-page-dnd-spells-view-all',
  imports: [
    CommonModule,
    SharedAngularMaterialTableComponent,
    SharedPaginatorComponent,
    UserAvatarListComponent, // used dynamically in columnDefs as a table cell component
    MatCardModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './page-dnd-spells-view-all.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './page-dnd-spells-view-all.component.scss',
  // fills the page height so the table scrolls inside; 30rem floor for short screens
  host: { class: 'flex min-h-120 flex-1 flex-col' },
})
export class PageDndSpellsViewAllComponent implements OnInit {
  static uniqueId = 'PageDndSpellsViewAllComponent';

  private readonly meta = inject(Meta);

  private readonly title = inject(Title);

  private readonly router = inject(Router);

  private readonly sharedCoreService = inject(SharedCoreService);

  private readonly sharedLocalStorageService = inject(SharedLocalStorageService);

  public readonly spellStore = inject(SpellsStore);

  ngOnInit(): void {
    this.title.setTitle(`Dungeons & Dragons | View List of Spells | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({ name: 'description', content: 'View a list of d&d spells.' });
  }

  public currentView = signal<'card:list' | 'card:gallery' | 'table'>(
    this.sharedLocalStorageService.get<'card:list' | 'card:gallery' | 'table'>(
      `${PageDndSpellsViewAllComponent.uniqueId}.currentView`,
    ) || 'table',
  );

  private readonly spellApi = inject(DndSpellApiService);

  // `filter: true` picks the filter from cellDataType; columns the API can't filter or sort say so
  private defaultColumnDefs: Column[] = [
    { field: 'id', headerName: 'ID', cellDataType: 'text', sortable: false, pinned: 'left', hide: true },
    { field: 'source_id', headerName: 'Source ID', cellDataType: 'text', sortable: false, hide: true },
    { field: 'name', headerName: 'Name', cellDataType: 'text', sortable: true, filter: true, pinned: 'left' },
    { field: 'slug', headerName: 'Slug', cellDataType: 'text', sortable: true, filter: true },
    {
      field: 'source',
      headerName: 'Source',
      headerTooltip: 'The book the spell is printed in',
      cellDataType: 'text',
      // the value stays the source object (the filter matches its slug); the cell shows "PHB (2024)"
      valueFormatter: ({ value, data }) => `${(value as Spell['source']).name_short} (${data.dnd_version_year})`,
      sortable: false,
      filter: 'appApiSetColumnFilter',
      filterParams: { appValuesPage: (query) => this.spellApi.getSourceOptions(query) },
    },
    { field: 'dnd_version', headerName: 'Version', cellDataType: 'text', sortable: false },
    {
      field: 'dnd_version_year',
      headerName: 'Version Year',
      cellDataType: 'date',
      dateFormat: 'y',
      // mid-year so a timezone shift can't roll it into the previous year
      valueGetter: (spell: Spell) => new Date(spell.dnd_version_year, 6, 1),
      sortable: true,
      filter: 'agDateColumnFilter',
      filterParams: { appGranularity: 'year', filterOptions: ['equals', 'inRange'] },
    },
    { field: 'source_page', headerName: 'Source Page', cellDataType: 'number', sortable: true, filter: true },
    {
      field: 'level',
      headerName: 'Level',
      headerTooltip: '0 is a cantrip',
      cellDataType: 'number',
      sortable: true,
      filter: true,
      filterParams: { appMin: 0, appMax: 9, appIntegerOnly: true },
    },
    {
      field: 'school',
      headerName: 'School',
      cellDataType: 'text',
      sortable: true,
      filter: 'appSetColumnFilter',
      filterParams: { values: Object.values(DndSpellModels.Spells.SpellSchool), valueFormatter: label },
    },
    { field: 'is_ritual', headerName: 'Is Ritual', cellDataType: 'boolean', sortable: true, filter: true },
    {
      field: 'is_unearthed_arcana',
      headerName: 'Is UA',
      headerTooltip: 'Unearthed Arcana (playtest material)',
      cellDataType: 'boolean',
      sortable: true,
      filter: true,
      hide: true,
    },
    { field: 'is_homebrew', headerName: 'Is Homebrew', cellDataType: 'boolean', sortable: true, filter: true, hide: true },
    { field: 'casting_time', headerName: 'Casting Time', cellDataType: 'text', sortable: true, filter: true },
    { field: 'range', headerName: 'Range', cellDataType: 'text', sortable: true, filter: true },
    { field: 'has_verbal_component', headerName: 'Has Verbal', cellDataType: 'boolean', sortable: true, filter: true },
    { field: 'has_somatic_component', headerName: 'Has Somatic', cellDataType: 'boolean', sortable: true, filter: true },
    {
      field: 'has_material_component',
      headerName: 'Has Material',
      cellDataType: 'boolean',
      sortable: true,
      filter: true,
    },
    { field: 'materials', headerName: 'Materials', cellDataType: 'text', sortable: true, filter: true },
    {
      field: 'components',
      headerName: 'Components',
      headerTooltip: 'Filter with Has Verbal, Has Somatic and Has Material',
      cellDataType: 'text',
      sortable: false,
      valueGetter: (spell: Spell) => {
        const components = [];
        if (spell.has_verbal_component) components.push('V');
        if (spell.has_somatic_component) components.push('S');
        if (spell.has_material_component) components.push('M');
        if (spell.materials) components.push(`(${spell.materials})`);
        return components.join(', ');
      },
    },
    { field: 'has_spell_cost', headerName: 'Has Spell Cost', cellDataType: 'boolean', sortable: true, filter: true },
    {
      field: 'are_materials_consumed',
      headerName: 'Are Materials Consumed',
      cellDataType: 'boolean',
      sortable: true,
      filter: true,
    },
    { field: 'duration', headerName: 'Duration', cellDataType: 'text', sortable: true, filter: true },
    { field: 'is_concentration', headerName: 'Is Concentration', cellDataType: 'boolean', sortable: true, filter: true },
    { field: 'description', headerName: 'Description', cellDataType: 'text', sortable: true, filter: true },
    { field: 'has_saving_throw', headerName: 'Has Saving Throw', cellDataType: 'boolean', sortable: true, filter: true },
    {
      field: 'difficulty_class_saving_throw_override',
      headerName: 'DC Override',
      cellDataType: 'number',
      sortable: true,
      filter: true,
      hide: true,
    },
    {
      field: 'damage_type',
      headerName: 'Damage Type',
      cellDataType: 'text',
      sortable: true,
      filter: 'appSetColumnFilter',
      filterParams: { values: [...DAMAGE_TYPES, null], valueFormatter: label },
    },
    {
      field: 'at_higher_levels',
      headerName: 'At Higher Levels',
      cellDataType: 'text',
      sortable: true,
      filter: true,
      hide: true,
    },
    { field: 'difficulty_class_saving_throw', headerName: 'DC Save', cellDataType: 'text', sortable: false, hide: true },
    {
      field: 'difficulty_class_type',
      headerName: 'DC Type',
      headerTooltip: 'The ability the save uses',
      cellDataType: 'text',
      sortable: true,
      filter: 'appSetColumnFilter',
      filterParams: {
        values: [...ABILITIES, null],
        valueFormatter: ({ value }) => (value ? value.toUpperCase() : 'None'),
      },
      hide: true,
    },
    // stat blocks
    {
      field: 'actions',
      headerName: 'Actions',
      cellDataType: 'component',
      component: DndSpellTableActionsComponent,
      sortable: false,
      appHideColumnSettingsMenu: true,
      pinned: 'right',
    },
  ];

  columnDefs: Column[] = this.getColumnDefs();

  // same key as the old full-ColumnDef[] format, which reconcileLayout ignores and the next save overwrites
  private static readonly layoutKey = `${PageDndSpellsViewAllComponent.uniqueId}.columnDefs`;

  private getColumnDefs(): Column[] {
    return reconcileLayout(
      this.sharedLocalStorageService.get(PageDndSpellsViewAllComponent.layoutKey),
      this.defaultColumnDefs,
    );
  }

  onColumnDefsChange(columnDefs: Column[]) {
    this.sharedLocalStorageService.set(PageDndSpellsViewAllComponent.layoutKey, toSavedLayout(columnDefs));
  }

  onResetColumnDefsClicked() {
    this.columnDefs = [...this.defaultColumnDefs];
    this.sharedLocalStorageService.remove(PageDndSpellsViewAllComponent.layoutKey);
  }

  onViewSpellClicked(spell: Spell) {
    this.router.navigate(DndSpellModels.Spells.spellRoute(spell));
  }
}
