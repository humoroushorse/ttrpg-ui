import { Component, inject, OnInit, signal, Type, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedAngularMaterialTableComponent } from '@ttrpg-ui/shared/table/ui';
import { TableModels } from '@ttrpg-ui/shared/table/models';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserAvatarListComponent } from '@ttrpg-ui/features/user/ui';
import { Meta, Title } from '@angular/platform-browser';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { DndSpellModels } from '@ttrpg-ui/features/dnd/spells/models';
import { SpellsStore } from '@ttrpg-ui/features/dnd/spells/data-access';
import { DndSpellTableActionsComponent } from '@ttrpg-ui/features/dnd/spells/ui';
import { Router } from '@angular/router';

@Component({
  selector: 'lib-page-dnd-spells-view-all',
  imports: [
    CommonModule,
    SharedAngularMaterialTableComponent,
    UserAvatarListComponent, // used dynamically in columnDefs as a table cell component // used dynamically in columnDefs as a table cell component
    MatCardModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './page-dnd-spells-view-all.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './page-dnd-spells-view-all.component.scss',
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

  private defaultColumnDefs: TableModels.ColumnDef<DndSpellModels.Spells.SpellSchema>[] = [
    { field: 'id', headerName: 'ID', cellDataType: 'text', sortable: true, pinned: 'left', hide: true },
    { field: 'source_id', headerName: 'Source ID', cellDataType: 'text', sortable: true, hide: true },
    { field: 'name', headerName: 'Name', cellDataType: 'text', sortable: true, pinned: 'left', hide: false },
    { field: 'slug', headerName: 'Slug', cellDataType: 'text', sortable: true, pinned: undefined, hide: false },
    {
      field: 'dnd_version',
      headerName: 'Version',
      cellDataType: 'text',
      sortable: true,
      pinned: undefined,
      hide: false,
    },
    {
      field: 'dnd_version_year',
      headerName: 'Version Year',
      cellDataType: 'number',
      sortable: true,
      pinned: undefined,
      hide: false,
    },
    {
      field: 'source_page',
      headerName: 'Source Page',
      cellDataType: 'number',
      sortable: true,
      pinned: undefined,
      hide: false,
    },
    { field: 'level', headerName: 'Level', cellDataType: 'number', sortable: true, pinned: undefined, hide: false },
    { field: 'school', headerName: 'School', cellDataType: 'text', sortable: true, pinned: undefined, hide: false },
    {
      field: 'is_ritual',
      headerName: 'Is Ritual',
      cellDataType: 'boolean',
      sortable: true,
      pinned: undefined,
      hide: false,
    },
    {
      field: 'is_unearthed_arcana',
      headerName: 'Is UA',
      cellDataType: 'boolean',
      sortable: true,
      pinned: undefined,
      hide: true,
    },
    {
      field: 'casting_time',
      headerName: 'Casting Time',
      cellDataType: 'text',
      sortable: true,
      pinned: undefined,
      hide: false,
    },
    { field: 'range', headerName: 'Range', cellDataType: 'text', sortable: true, pinned: undefined, hide: false },
    {
      field: 'has_verbal_component',
      headerName: 'Has Verbal',
      cellDataType: 'boolean',
      sortable: true,
      pinned: undefined,
      hide: false,
    },
    {
      field: 'has_somantic_component',
      headerName: 'Has Somantic',
      cellDataType: 'boolean',
      sortable: true,
      pinned: undefined,
      hide: false,
    },
    {
      field: 'has_material_component',
      headerName: 'Has Material',
      cellDataType: 'boolean',
      sortable: true,
      pinned: undefined,
      hide: false,
    },
    {
      field: 'materials',
      headerName: 'Has Material',
      cellDataType: 'text',
      sortable: true,
      pinned: undefined,
      hide: false,
    },

    {
      field: 'components',
      headerName: 'Components',
      cellDataType: 'text',
      sortable: true,
      pinned: undefined,
      hide: false,
      valueGetter: (spell: DndSpellModels.Spells.SpellSchema) => {
        const components = [];
        if (spell.has_verbal_component) components.push('V');
        if (spell.has_somatic_component) components.push('S');
        if (spell.has_material_component) components.push('M');
        if (spell.materials) components.push(`(${spell.materials})`);
        return components.join(', ');
      },
    },

    {
      field: 'has_spell_cost',
      headerName: 'Has Spell Cost',
      cellDataType: 'boolean',
      sortable: true,
      pinned: undefined,
      hide: false,
    },
    {
      field: 'are_materials_consumed',
      headerName: 'Are Materials Consumed',
      cellDataType: 'boolean',
      sortable: true,
      pinned: undefined,
      hide: false,
    },
    { field: 'duration', headerName: 'Duration', cellDataType: 'text', sortable: true, pinned: undefined, hide: false },
    {
      field: 'is_concentraiton',
      headerName: 'Is Concentration',
      cellDataType: 'boolean',
      sortable: true,
      pinned: undefined,
      hide: false,
    },
    {
      field: 'description',
      headerName: 'Description',
      cellDataType: 'text',
      sortable: true,
      pinned: undefined,
      hide: false,
    },
    {
      field: 'has_saving_throw',
      headerName: 'Has Saving Throw',
      cellDataType: 'text',
      sortable: true,
      pinned: undefined,
      hide: false,
    },
    {
      field: 'difficulty_class_saving_throw_override',
      headerName: 'DC Override',
      cellDataType: 'number',
      sortable: true,
      pinned: undefined,
      hide: true,
    },
    {
      field: 'damage_type',
      headerName: 'Damage Type',
      cellDataType: 'text',
      sortable: true,
      pinned: undefined,
      hide: false,
    },
    {
      field: 'at_higher_levels',
      headerName: 'At Higher Levels',
      cellDataType: 'text',
      sortable: true,
      pinned: undefined,
      hide: true,
    },
    {
      field: 'difficulty_class_saving_throw',
      headerName: 'DC Save',
      cellDataType: 'text',
      sortable: true,
      pinned: undefined,
      hide: true,
    },
    {
      field: 'difficulty_class_type',
      headerName: 'DC Type',
      cellDataType: 'text',
      sortable: true,
      pinned: undefined,
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

  columnDefs: TableModels.ColumnDef<DndSpellModels.Spells.SpellSchema>[] = this.getColumnDefs();

  private getColumnDefs(): TableModels.ColumnDef<DndSpellModels.Spells.SpellSchema>[] {
    const storedColumnDefs: TableModels.ColumnDef<DndSpellModels.Spells.SpellSchema>[] | null =
      this.sharedLocalStorageService.get(`${PageDndSpellsViewAllComponent.uniqueId}.columnDefs`);
    if (storedColumnDefs) {
      return storedColumnDefs.map((c) => {
        if (c.cellDataType === 'component') {
          return {
            ...c,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            component: this.defaultColumnDefs.find((d) => d.field === c.field)?.component as Type<any>,
          };
        }
        return c;
      });
    }
    return [...this.defaultColumnDefs];
  }

  onColumnDefsChange(columnDefs: TableModels.ColumnDef<DndSpellModels.Spells.SpellSchema>[]) {
    this.sharedLocalStorageService.set(`${PageDndSpellsViewAllComponent.uniqueId}.columnDefs`, columnDefs);
  }

  onResetColumnDefsClicked() {
    this.columnDefs = [...this.defaultColumnDefs];
    this.sharedLocalStorageService.remove(`${PageDndSpellsViewAllComponent.uniqueId}.columnDefs`);
  }

  onViewGameSessionClicked(event: DndSpellModels.Spells.SpellSchema) {
    this.router.navigate(['event-planning', 'game-session', event.id]);
  }
}
