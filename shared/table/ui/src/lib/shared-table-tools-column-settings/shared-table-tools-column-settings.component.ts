import { ChangeDetectionStrategy, Component, model } from '@angular/core';

import { TableModels } from '@ttrpg-ui/shared/table/models';
import { CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'lib-shared-table-tools-column-settings',
  imports: [
    ScrollingModule,
    CdkDropList,
    CdkDrag,
    CdkDragPlaceholder,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCheckboxModule,
  ],
  templateUrl: './shared-table-tools-column-settings.component.html',
  styleUrl: './shared-table-tools-column-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedTableToolsColumnSettingsComponent<T> {
  columnDefs = model<TableModels.ColumnDef<T>[]>([]);

  drop(event: CdkDragDrop<TableModels.ColumnDef<T>[]>) {
    const columnDefs = this.columnDefs();
    moveItemInArray(columnDefs, event.previousIndex, event.currentIndex);
    this.columnDefs.set([...columnDefs]);
  }

  onCheckboxClicked(columnDef: TableModels.ColumnDef<T>, event: MatCheckboxChange) {
    this.columnDefs.set([
      ...this.columnDefs().map((c) => {
        return c.field === columnDef.field ? { ...c, hide: !event.checked } : c;
      }),
    ]);
  }
}
