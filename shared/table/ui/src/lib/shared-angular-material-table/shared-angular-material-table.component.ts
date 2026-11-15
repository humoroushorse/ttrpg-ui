import {
  AfterViewInit,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  OnDestroy,
  output,
  signal,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModels } from '@ttrpg-ui/shared/table/models';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SharedTableDynamicHostDirective } from '@ttrpg-ui/shared/table/util';
import { MatSort, MatSortable, MatSortModule, SortDirection } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { SharedTableService } from '@ttrpg-ui/shared/table/data-access';
import { groupBy, mergeMap, Subject, takeUntil, timer } from 'rxjs';
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
import { SharedNotificationService } from '@ttrpg-ui/shared/notification/data-access';
import { SharedDatePipe } from '@ttrpg-ui/shared/date/util';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounce, debounceTime } from 'rxjs/operators';
import { SharedTableColumnFilterComponent } from '../shared-table-column-filter/shared-table-column-filter.component';
import { FilterChange, matchesFilter } from '../shared-table-column-filter/column-filter';

type ColumnDef<T> = TableModels.ColumnDef<T>;

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
    SharedDatePipe,
    SharedTableColumnFilterComponent,
  ],
  templateUrl: './shared-angular-material-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './shared-angular-material-table.component.scss',
  host: { '[class.shared-table-fill]': 'fillHeight()' },
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

  /** `data` is one page fetched by the parent, which also renders the paginator */
  serverSidePagination = input<boolean>(false);

  stickyHeader = input<boolean>(true);
  /**
   * Grow into the parent's free height and scroll inside, instead of the 400px cap.
   * The parent has to be a flex column with a height (or `min-h-0` down the chain).
   */
  fillHeight = input<boolean>(false);

  dataSource = new MatTableDataSource<T>([]);

  selectedPageSize = this.sharedTableService.selectedPageSize;

  showFirstLastButtons = this.sharedTableService.showFirstLastButtons;

  pageSizeOptions = this.sharedTableService.getPageSizeOptions();

  globalFilter = signal('');

  /**
   * AG Grid's filter model, keyed by column id. Bind it to a store for server-side tables
   * (`[filterModel]` + `(filterModelChange)`); left unbound, the table filters its own rows.
   */
  filterModel = model<SharedModels.Store.Filters>({});

  /** One column's sort (AG Grid's sort model item). Server-side tables send it to the API. */
  sortModel = model<SharedModels.Store.Sort | null>(null);

  protected readonly columnId = TableModels.columnId;

  protected readonly columnFilterName = TableModels.columnFilterName;

  // what the rows are filtered by here: server-side tables only search the page they hold
  private readonly combinedFilter = computed(() =>
    JSON.stringify({ global: this.globalFilter(), filters: this.serverSidePagination() ? {} : this.filterModel() }),
  );

  /** Column filter edits, each column applied after its own delay (typing waits, picks don't) */
  private readonly filterEdits = new Subject<FilterChange & { colId: string }>();

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

    this.filterEdits
      .pipe(
        groupBy((edit) => edit.colId),
        mergeMap((edits) => edits.pipe(debounce((edit) => timer(edit.debounceMs)))),
        takeUntil(this.onDestroy$),
      )
      .subscribe(({ colId, model }) => this.setColumnFilter(colId, model));
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
    this.dataSource.filterPredicate = (row: T, filter: string) => {
      const { global, filters } = JSON.parse(filter) as { global: string; filters: SharedModels.Store.Filters };
      if (global && !Object.values(row as object).join(' ').toLowerCase().includes(global)) return false;
      return Object.entries(filters).every(([colId, model]) => {
        const columnDef = this.tableColumnDefs().find((c) => TableModels.columnId(c) === colId);
        return !columnDef || matchesFilter(this.getValue(columnDef, row), model);
      });
    };

    // server-side tables get their page sorted by the API, so the rows stay as given
    if (!this.serverSidePagination()) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }

    this.sort.sortChange.pipe(takeUntil(this.onDestroy$)).subscribe(({ active, direction }) => {
      this.sortModel.set(active && direction ? { colId: active, sort: direction } : null);
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

  /** A column's values in the rows held, for set filters that list none */
  public getUniqueColumnValues(columnDef: ColumnDef<T>): string[] {
    const values = (this.dataSource.data || []).map((row) => this.getValue(columnDef, row));
    return [...new Set(values.filter((v) => v != null && v !== '').map(String))].sort();
  }

  onFilterChanged(columnDef: ColumnDef<T>, change: FilterChange): void {
    this.filterEdits.next({ ...change, colId: TableModels.columnId(columnDef) });
  }

  clearFilter(columnDef: ColumnDef<T>): void {
    this.setColumnFilter(TableModels.columnId(columnDef), null);
  }

  protected readonly hasFilters = computed(() => Object.keys(this.filterModel()).length > 0);

  /** Clears every column filter (the table search box is separate) */
  resetFilters(): void {
    this.filterModel.set({});
  }

  private setColumnFilter(colId: string, filter: SharedModels.Store.Filter | null): void {
    const { [colId]: _removed, ...rest } = this.filterModel();
    if (!filter && !_removed) return;
    this.filterModel.set(filter ? { ...rest, [colId]: filter } : rest);
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
    // a hidden column can't show its filter, so drop it
    if (this.filterModel()[TableModels.columnId(columnDef)]) {
      this.clearFilter(columnDef);
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

  /** What a cell shows: `valueFormatter` over the value, or the value */
  getDisplayValue(column: ColumnDef<T>, rowData: T) {
    const value = this.getValue(column, rowData);
    return column.valueFormatter ? column.valueFormatter({ value, data: rowData }) : value;
  }

  getValue(column: ColumnDef<T>, rowData: any, useValueGetter = true) {
    if (useValueGetter && column.valueGetter) {
      return column.valueGetter(rowData);
    }
    return rowData[column.field];
  }
}
