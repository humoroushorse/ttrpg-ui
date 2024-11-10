import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModels } from '@ttrpg-ui/shared/table/models';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SharedTableDynamicHostDirective } from '@ttrpg-ui/shared/table/util';
import { MatSort, MatSortable, MatSortModule, SortDirection } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { SharedTableService } from '@ttrpg-ui/shared/table/data-access';
import { Subject, takeUntil } from 'rxjs';
import { CdkDragDrop, CdkDrag, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { SharedTableToolsColumnSettingsComponent } from '../shared-table-tools-column-settings/shared-table-tools-column-settings.component';
import { SharedTableToolsDownloadComponent } from '../shared-table-tools-download/shared-table-tools-download.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ColumnDef } from 'shared/table/models/src/lib/models';

@Component({
  selector: 'lib-shared-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    SharedTableDynamicHostDirective,
    SharedTableToolsColumnSettingsComponent,
    SharedTableToolsDownloadComponent,

    ScrollingModule,
    CdkDropList,
    CdkDrag,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    MatInputModule,
    MatTableModule,
    MatCheckboxModule,
    MatProgressBarModule,
  ],
  templateUrl: './shared-table.component.html',
  styleUrl: './shared-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedTableComponent<T> implements AfterViewInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  private sharedTableService = inject(SharedTableService);

  columnDefsChange = output<TableModels.ColumnDef[]>();

  resetColumnDefsClicked = output<boolean>();

  rowClicked = output<T>();

  rowDoubleClicked = output<T>();

  tableHeader = input('');

  loading = input(false);

  columnDefs = input<TableModels.ColumnDef[]>([]);

  tableColumnDefs = signal<TableModels.ColumnDef[]>([]);

  displayedColumns = computed<string[]>(() =>
    this.tableColumnDefs()
      .filter((c) => !c.hide)
      .map((c) => c.field),
  );

  data = input<T[]>([]);

  stickyHeader = input<boolean>(true);

  dataSource = new MatTableDataSource<T>([]);

  selectedPageSize$$ = this.sharedTableService.selectedPageSize$$;

  showFirstLastButtons$$ = this.sharedTableService.showFirstLastButtons$$;

  pageSizeOptions$$ = this.sharedTableService.getPageSizeOptions();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    effect(() => {
      this.dataSource.data = this.data();
    });

    effect(() => {
      this.tableColumnDefs.set(this.columnDefs().sort(this.sortPinned));
    });
  }

  private sortPinned(a: TableModels.ColumnDef, b: TableModels.ColumnDef) {
    if (a.pinned === 'left' && b.pinned !== 'left') {
      return -1;
    } else if (b.pinned === 'left' && a.pinned !== 'left') {
      return 1;
    } else if (a.pinned === 'right' && b.pinned !== 'right') {
      return 1;
    } else if (a.pinned !== 'right' && b.pinned === 'right') {
      return -1;
    } else {
      return 0; // Maintain order if both columns are on the same side
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.sort.sortChange.pipe(takeUntil(this.onDestroy$)).subscribe(() => {
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  drop(event: CdkDragDrop<TableModels.ColumnDef[]>) {
    const previousColumnIndex: number =
      this.tableColumnDefs().findIndex((c) => c.field === this.displayedColumns()[event.previousIndex]) ?? -1;
    const currentColumnIndex: number =
      this.tableColumnDefs().findIndex((c) => c.field === this.displayedColumns()[event.currentIndex]) ?? -1;
    const columnDefs = this.tableColumnDefs();
    moveItemInArray(columnDefs, previousColumnIndex, currentColumnIndex);
    if (currentColumnIndex < this.tableColumnDefs().length - 1) {
      if (columnDefs[currentColumnIndex + 1].pinned === 'left') {
        columnDefs[currentColumnIndex].pinned = 'left';
      }
    }
    if (currentColumnIndex > 0) {
      if (columnDefs[currentColumnIndex - 1].pinned === 'right') {
        columnDefs[currentColumnIndex].pinned = 'right';
      }
    }
    this.tableColumnDefs.set([...columnDefs.sort(this.sortPinned)]);
    // this.tableColumnDefs.update((columnDefs: ColumnDef[]) => columnDefs.map(c => c.field === columnDef.field ? {...c, hide: true} : c).sort(this.sortPinned))
    this.onColumnDefsChange(this.tableColumnDefs());
  }

  onPage(event: PageEvent) {
    this.sharedTableService.setSelectedPageSize(event.pageSize);
  }

  private onColumnDefsChange(columnDefs: TableModels.ColumnDef[]) {
    this.columnDefsChange.emit(columnDefs);
  }

  updateTableColumnDefs(columnDefs: TableModels.ColumnDef[]) {
    this.tableColumnDefs.set(columnDefs);
    this.onColumnDefsChange(this.tableColumnDefs());
  }

  pinColumn(columnDef: TableModels.ColumnDef, pinned: TableModels.SharedTablePinned) {
    // columnDef.pinned = pinned;
    // this.tableColumnDefs.set([...this.tableColumnDefs().sort(this.sortPinned)])
    this.tableColumnDefs.update((columnDefs: TableModels.ColumnDef[]) =>
      columnDefs.map((c) => (c.field === columnDef.field ? { ...c, pinned } : c)).sort(this.sortPinned),
    );

    this.onColumnDefsChange(this.tableColumnDefs());
  }

  sortColumn(columnDef: TableModels.ColumnDef, sort: SortDirection) {
    if (sort) {
      this.sort.sort(<MatSortable>{ id: columnDef.field, start: sort, disableClear: true });
    } else {
      this.sort.sort({ id: '', start: sort, disableClear: false });
      this.sort.direction = sort;
    }
  }

  hideColumn(columnDef: TableModels.ColumnDef) {
    // columnDef.hide = true;
    // this.tableColumnDefs.set([...this.columnDefs()])
    this.tableColumnDefs.update((columnDefs: TableModels.ColumnDef[]) =>
      columnDefs.map((c) => (c.field === columnDef.field ? { ...c, hide: true } : c)),
    );
    this.onColumnDefsChange(this.tableColumnDefs());
  }

  applyFilter(event?: Event) {
    if (!event) {
      this.dataSource.filter = '';
      return;
    }
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getValue(column: ColumnDef, rowData: any) {
    return column.valueGetter ? column.valueGetter(rowData) : rowData[column.field];
  }
}
