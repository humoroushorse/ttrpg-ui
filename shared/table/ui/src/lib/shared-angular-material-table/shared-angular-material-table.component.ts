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
import { CdkDragDrop, CdkDrag, CdkDropList, CdkDragPlaceholder, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { SharedTableToolsColumnSettingsComponent } from '../shared-table-tools-column-settings/shared-table-tools-column-settings.component';
import { SharedTableToolsDownloadComponent } from '../shared-table-tools-download/shared-table-tools-download.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ColumnDef } from 'shared/table/models/src/lib/models';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SharedNotificationService } from '@ttrpg-ui/shared/notification/data-access';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'lib-shared-angular-material-table',
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
    CdkDragPlaceholder,
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
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './shared-angular-material-table.component.html',
  styleUrl: './shared-angular-material-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedAngularMaterialTableComponent<T> implements AfterViewInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  private readonly sharedTableService = inject(SharedTableService);

  private readonly sharedNotificationService = inject(SharedNotificationService);

  columnDefsChange = output<TableModels.ColumnDef<T>[]>();

  resetColumnDefsClicked = output<boolean>();

  rowClicked = output<T>();

  rowDoubleClicked = output<T>();

  dataQa = input('SharedAngularMaterialTable');

  tableHeader = input('');

  loading = input(false);

  columnDefs = input<TableModels.ColumnDef<T>[]>([]);

  tableColumnDefs = signal<TableModels.ColumnDef<T>[]>([]);

  displayedColumns = computed<string[]>(() =>
    this.tableColumnDefs()
      .filter((c) => !c.hide)
      .map((c) => c.field),
  );

  data = input<T[]>([]);

  stickyHeader = input<boolean>(true);

  dataSource = new MatTableDataSource<T>([]);

  selectedPageSize = this.sharedTableService.selectedPageSize;

  showFirstLastButtons = this.sharedTableService.showFirstLastButtons;

  pageSizeOptions = this.sharedTableService.getPageSizeOptions();

  globalFilter = signal('');

  columnFilters = signal(new Map<string, string>());

  private readonly combinedFilter = computed(() => {
    const global = this.globalFilter();
    const columns = this.columnFilters();
    return JSON.stringify({
      global,
      columns: Array.from(columns.entries()),
    });
  });

  textFilterTypes = signal(new Map<string, string>());

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    effect(() => {
      this.dataSource.data = this.data() ?? [];
    });

    effect(() => {
      this.tableColumnDefs.set(this.columnDefs().sort(this.sortPinned));
    });

    toObservable(this.combinedFilter)
      .pipe(debounceTime(this.sharedTableService.getFilterDebounceTime()()), takeUntil(this.onDestroy$))
      .subscribe((combined) => {
        this.dataSource.filter = combined;
      });
  }

  private sortPinned(a: TableModels.ColumnDef<T>, b: TableModels.ColumnDef<T>) {
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
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      let parsed: { global: string; columns: [string, string][] } = { global: '', columns: [] };
      try {
        parsed = JSON.parse(filter);
      } catch {
        /* ignore */
      }

      if (parsed.global) {
        const rowString = Object.values(data).join(' ').toLowerCase();
        if (!rowString.includes(parsed.global)) return false;
      }

      if (Array.isArray(parsed.columns)) {
        for (const [field, filterValue] of parsed.columns) {
          const columnDef = this.tableColumnDefs().find((col) => col.field === field);
          if (!columnDef || !columnDef.filter) continue;

          const rawCellValue = this.getValue(columnDef, data);
          const cellValue = rawCellValue?.toString().toLowerCase() || '';

          if (columnDef.filter === 'agTextColumnFilter') {
            const filterType = this.textFilterTypes().get(field) || 'contains';
            switch (filterType) {
              case 'contains':
                if (!cellValue.includes(filterValue)) return false;
                break;
              case 'notContains':
                if (cellValue.includes(filterValue)) return false;
                break;
              case 'equals':
                if (cellValue !== filterValue) return false;
                break;
              case 'notEqual':
                if (cellValue === filterValue) return false;
                break;
              case 'startsWith':
                if (!cellValue.startsWith(filterValue)) return false;
                break;
              case 'endsWith':
                if (!cellValue.endsWith(filterValue)) return false;
                break;
              case 'blank':
                if (cellValue.trim() !== '') return false;
                break;
              case 'notBlank':
                if (cellValue.trim() === '') return false;
                break;
            }
          } else if (columnDef.filter === 'agDateColumnFilter') {
            const filterType = this.textFilterTypes().get(field) || 'equals';
            const filterDate = filterValue ? new Date(filterValue) : null;
            const cellDate = rawCellValue ? new Date(rawCellValue) : null;
            switch (filterType) {
              case 'equals':
                if (!cellDate || !filterDate || cellDate.toDateString() !== filterDate.toDateString()) return false;
                break;
              case 'notEqual':
                if (cellDate && filterDate && cellDate.toDateString() === filterDate.toDateString()) return false;
                break;
              case 'before':
                if (!cellDate || !filterDate || cellDate >= filterDate) return false;
                break;
              case 'after':
                if (!cellDate || !filterDate || cellDate <= filterDate) return false;
                break;
              case 'blank':
                if (cellDate) return false;
                break;
              case 'notBlank':
                if (!cellDate) return false;
                break;
            }
          } else if (columnDef.filter === 'agNumberColumnFilter') {
            const filterType = this.textFilterTypes().get(field) || 'equals';
            const filterNumber = filterValue !== '' ? Number(filterValue) : null;
            const cellNumber =
              rawCellValue !== undefined && rawCellValue !== null && rawCellValue !== '' ? Number(rawCellValue) : null;
            switch (filterType) {
              case 'equals':
                if (cellNumber !== filterNumber) return false;
                break;
              case 'notEqual':
                if (cellNumber === filterNumber) return false;
                break;
              case 'greaterThan':
                if (cellNumber === null || filterNumber === null || cellNumber <= filterNumber) return false;
                break;
              case 'greaterThanOrEqual':
                if (cellNumber === null || filterNumber === null || cellNumber < filterNumber) return false;
                break;
              case 'lessThan':
                if (cellNumber === null || filterNumber === null || cellNumber >= filterNumber) return false;
                break;
              case 'lessThanOrEqual':
                if (cellNumber === null || filterNumber === null || cellNumber > filterNumber) return false;
                break;
              case 'blank':
                if (cellNumber !== null && cellNumber !== undefined && `${cellNumber}` !== '') return false;
                break;
              case 'notBlank':
                if (cellNumber === null || cellNumber === undefined || `${cellNumber}` === '') return false;
                break;
            }
          } else if (columnDef.filter === 'agSetColumnFilter') {
            const selectedValues = filterValue ? filterValue.split(',') : [];
            if (selectedValues.length > 0 && !selectedValues.includes(String(rawCellValue))) {
              return false;
            }
          }
        }
      }

      return true;
    };

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

  drop(event: CdkDragDrop<TableModels.ColumnDef<T>[]>) {
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
    this.onColumnDefsChange(this.tableColumnDefs());
  }

  onPage(event: PageEvent) {
    this.sharedTableService.setSelectedPageSize(event.pageSize);
  }

  private onColumnDefsChange(columnDefs: TableModels.ColumnDef<T>[]) {
    this.columnDefsChange.emit(columnDefs);
  }

  public getUniqueColumnValues(field: string): string[] {
    const data = this.dataSource.data || [];
    return Array.from(
      new Set(
        data
          .map((row) => {
            const v = this.getValue({ field } as any, row);
            return v != null && v !== '' ? String(v) : null;
          })
          .filter((v) => v != null),
      ),
    ).sort();
  }

  updateTableColumnDefs(columnDefs: TableModels.ColumnDef<T>[]) {
    this.tableColumnDefs.set(columnDefs);
    this.onColumnDefsChange(this.tableColumnDefs());
  }

  pinColumn(columnDef: TableModels.ColumnDef<T>, pinned: TableModels.SharedTablePinned) {
    // columnDef.pinned = pinned;
    // this.tableColumnDefs.set([...this.tableColumnDefs().sort(this.sortPinned)])
    this.tableColumnDefs.update((columnDefs: TableModels.ColumnDef<T>[]) =>
      columnDefs.map((c) => (c.field === columnDef.field ? { ...c, pinned } : c)).sort(this.sortPinned),
    );

    this.onColumnDefsChange(this.tableColumnDefs());
  }

  sortColumn(columnDef: TableModels.ColumnDef<T>, sort: SortDirection) {
    if (sort) {
      this.sort.sort(<MatSortable>{ id: columnDef.field, start: sort, disableClear: true });
    } else {
      this.sort.sort({ id: '', start: sort, disableClear: false });
      this.sort.direction = sort;
    }
  }

  hideColumn(columnDef: TableModels.ColumnDef<T>) {
    // Remove filter and filter type for the hidden column
    const filters = new Map(this.columnFilters());
    const types = new Map(this.textFilterTypes());
    const hadFilter = filters.has(columnDef.field); // Check if a filter existed

    filters.delete(columnDef.field);
    types.delete(columnDef.field);
    this.columnFilters.set(filters);
    this.textFilterTypes.set(types);

    if (hadFilter) {
      this.sharedNotificationService.openSnackBar(
        `Filter for "${columnDef.headerName ?? columnDef.field}" cleared when column was hidden.`,
      );
    }

    // Hide the column
    this.tableColumnDefs.update((columnDefs: TableModels.ColumnDef<T>[]) =>
      columnDefs.map((c) => (c.field === columnDef.field ? { ...c, hide: true } : c)),
    );
    this.onColumnDefsChange(this.tableColumnDefs());
  }

  applyGlobalFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.globalFilter.set(filterValue);
  }

  clearGlobalFilter() {
    this.globalFilter.set('');
  }

  applyColumnFilter(field: string, value: any, filterType = 'contains') {
    const filters = new Map(this.columnFilters());
    const types = new Map(this.textFilterTypes());
    types.set(field, filterType);

    if (['blank', 'notBlank'].includes(filterType)) {
      filters.set(field, '');
    } else if (value === '' || value === null || value === undefined) {
      filters.delete(field);
      types.delete(field);
    } else if (Array.isArray(value)) {
      filters.set(field, value.join(','));
    } else if (value instanceof Date) {
      filters.set(field, value.toISOString().slice(0, 10));
    } else if (typeof value === 'string') {
      filters.set(field, value.trim().toLowerCase());
    } else {
      filters.set(field, value);
    }

    this.columnFilters.set(filters);
    this.textFilterTypes.set(types);
  }

  applyFilter(event?: Event) {
    if (!event) {
      this.dataSource.filter = '';
      return;
    }
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getValue(column: ColumnDef<T>, rowData: any, useValueGetter = true) {
    if (useValueGetter && column.valueGetter) {
      return column.valueGetter(rowData);
    }
    return rowData[column.field];
  }

  isSetOptionSelected(field: string, option: string): boolean {
    const selected = this.columnFilters().get(field)?.split(',').filter(Boolean) || [];
    return selected.includes(option);
  }

  isAllSetOptionsSelected(field: string): boolean {
    const all = this.getUniqueColumnValues(field);
    const selected = this.columnFilters().get(field)?.split(',').filter(Boolean) || [];
    return all.length > 0 && selected.length === all.length;
  }

  isSomeSetOptionsSelected(field: string): boolean {
    const all = this.getUniqueColumnValues(field);
    const selected = this.columnFilters().get(field)?.split(',').filter(Boolean) || [];
    return selected.length > 0 && selected.length < all.length;
  }

  toggleSetOption(field: string, option: string) {
    const selected = this.columnFilters().get(field)?.split(',').filter(Boolean) || [];
    const idx = selected.indexOf(option);
    if (idx > -1) {
      selected.splice(idx, 1);
    } else {
      selected.push(option);
    }
    this.applyColumnFilter(field, selected, 'set');
  }

  toggleSelectAllSetOptions(field: string) {
    const all = this.getUniqueColumnValues(field);
    if (this.isAllSetOptionsSelected(field)) {
      this.applyColumnFilter(field, [], 'set');
    } else {
      this.applyColumnFilter(field, all, 'set');
    }
  }
}
