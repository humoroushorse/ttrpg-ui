import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModels } from '@ttrpg-ui/shared/table/models';
import { CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'lib-shared-table-tools-column-settings',
  standalone: true,
  imports: [
    CommonModule,
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
export class SharedTableToolsColumnSettingsComponent {
  columnDefs = model<TableModels.ColumnDef[]>([]);

  drop(event: CdkDragDrop<TableModels.ColumnDef[]>) {
    const columnDefs = this.columnDefs();
    moveItemInArray(columnDefs, event.previousIndex, event.currentIndex);
    this.columnDefs.set([...columnDefs]);
  }

  onCheckboxClicked(columnDef: TableModels.ColumnDef, event: MatCheckboxChange) {
    this.columnDefs.set([
      ...this.columnDefs().map((c) => {
        return c.field === columnDef.field ? { ...c, hide: !event.checked } : c;
      }),
    ]);
  }
}
