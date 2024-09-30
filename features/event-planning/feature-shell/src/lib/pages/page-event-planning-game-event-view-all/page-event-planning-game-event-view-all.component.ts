import { ChangeDetectionStrategy, Component, inject, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedTableComponent } from '@ttrpg-ui/shared/table/ui';
import { TableModels } from '@ttrpg-ui/shared/table/models';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { MatCardModule } from '@angular/material/card';
import { TempExampleComponent } from '../temp-example/temp-example.component';
import { TempExample2Component } from '../temp-example-2/temp-example-2.component';

interface YourData {
  id: number;
  name: string;
  icon?: string;
  icon2?: string;
  hiddenColumn: string;
  // other fields...
}

@Component({
  selector: 'lib-page-event-planning-game-event-view-all',
  standalone: true,
  imports: [CommonModule, SharedTableComponent, MatCardModule],
  templateUrl: './page-event-planning-game-event-view-all.component.html',
  styleUrl: './page-event-planning-game-event-view-all.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageEventPlanningGameEventViewAllComponent {
  private sharedLocalStorageService = inject(SharedLocalStorageService);

  displayedColumns = ['name', 'icon', 'customColumn', 'iconColumn'];

  data: YourData[] = [
    { id: 1, name: 'Element asd', icon: 'person', hiddenColumn: 'foobar' },
    { id: 2, name: 'Element bd', icon: 'person', hiddenColumn: 'foobar' },
    { id: 3, name: 'Element fdc', icon: 'person', hiddenColumn: 'foobar' },
    { id: 4, name: 'Element 🥷', icon: 'person', hiddenColumn: 'foobar' },
    { id: 5, name: 'Element bde', icon: 'person', hiddenColumn: 'foobar' },
    { id: 6, name: 'Element 🤌🏼🤌🏼', icon: 'person', hiddenColumn: 'foobar' },
    { id: 7, name: 'Element gfds', icon: 'person', hiddenColumn: 'foobar' },
    { id: 8, name: 'Element j76h', icon: 'person', hiddenColumn: 'foobar' },
    { id: 9, name: 'Element ig4', icon: 'person', hiddenColumn: 'foobar' },
    { id: 10, name: 'Element sgfdj', icon: 'person', hiddenColumn: 'foobar' },
    { id: 11, name: 'Element sgfk', icon: 'person', hiddenColumn: 'foobar' },
    { id: 12, name: 'Element 45fl', icon: 'person', hiddenColumn: 'foobar' },
    { id: 13, name: 'Element 1vstd3', icon: 'person', hiddenColumn: 'foobar' },
    { id: 14, name: 'Element 1vsr4', icon: 'person', hiddenColumn: 'foobar' },
    { id: 15, name: 'Element 1vsf5', icon: 'person', hiddenColumn: 'foobar' },
    { id: 16, name: 'Element 1vsf6', icon: 'person', hiddenColumn: 'foobar' },
    { id: 17, name: 'Element 1vsf7', icon: 'delete_forever', hiddenColumn: 'foobar' },
  ];

  private defaultColumnDefs: TableModels.ColumnDef[] = [
    { field: 'id', headerName: 'ID', cellDataType: 'number', sortable: true },
    { field: 'name', headerName: 'Name', cellDataType: 'text', sortable: true },
    { field: 'icon', headerName: 'Pinned Right', cellDataType: 'text', sortable: true, pinned: 'right' },
    { field: 'icon1', headerName: 'Pinned Left', cellDataType: 'text', sortable: true, pinned: 'left' },
    { field: 'icon2', headerName: 'foobar', cellDataType: 'text', sortable: true },
    { field: 'icon3', headerName: 'foobar', cellDataType: 'text', sortable: true },
    // { field: 'icon4', headerName: 'foobar', cellDataType: 'text', sortable: true , },
    { field: 'customColumn', headerName: 'Custom Column', component: TempExampleComponent, cellDataType: 'component' },
    {
      field: 'customColumn2',
      headerName: 'Custom Column 2',
      component: TempExample2Component,
      cellDataType: 'component',
    },
  ];

  columnDefs: TableModels.ColumnDef[] = this.getColumnDefs();

  private getColumnDefs(): TableModels.ColumnDef[] {
    const storedColumnDefs: TableModels.ColumnDef[] | null = this.sharedLocalStorageService.get(
      'PageEventPlanningGameEventViewAllComponent.columnDefs',
    );
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

  onColumnDefsChange(columnDefs: TableModels.ColumnDef[]) {
    this.sharedLocalStorageService.set('PageEventPlanningGameEventViewAllComponent.columnDefs', columnDefs);
  }

  onResetColumnDefsClicked() {
    this.columnDefs = [...this.defaultColumnDefs];
    this.sharedLocalStorageService.remove('PageEventPlanningGameEventViewAllComponent.columnDefs');
  }
}
