import { Component, computed, effect, inject, OnInit, signal, Type, OnDestroy } from '@angular/core';

import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { debounceTime } from 'rxjs';

import { SharedAngularMaterialTableComponent } from '@ttrpg-ui/shared/table/ui';
import { TableModels } from '@ttrpg-ui/shared/table/models';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { KeyboardShortcutService } from '@ttrpg-ui/shared/keyboard-shortcut/data-access';
import { KeyboardShortcutsDialogComponent } from '@ttrpg-ui/shared/keyboard-shortcut/ui';

import { WorkItemStore, SprintManagementApiService } from '@ttrpg-ui/features/sprint-management/data-access';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';
import { TagFilterComponent, TagWithCount } from '@ttrpg-ui/features/sprint-management/ui';

const { WorkItemType, WorkItemStatus, WorkItemPriority } = SprintModels.WorkItem;
const { FilterType, FilterCondition } = SprintModels.Filter;
type WorkItem = SprintModels.WorkItem.WorkItem;
type WorkItemType = SprintModels.WorkItem.WorkItemType;
type WorkItemStatus = SprintModels.WorkItem.WorkItemStatus;
type WorkItemPriority = SprintModels.WorkItem.WorkItemPriority;
type FilterModel = SprintModels.Filter.FilterModel;

@Component({
  selector: 'lib-page-work-items-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SharedAngularMaterialTableComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    ScrollingModule,
    TagFilterComponent,
  ],
  templateUrl: './page-work-items-list.component.html',
  styleUrls: ['./page-work-items-list.component.scss'],
})
export class PageWorkItemsListComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly sharedCoreService = inject(SharedCoreService);
  private readonly sharedLocalStorageService = inject(SharedLocalStorageService);
  private readonly apiService = inject(SprintManagementApiService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly keyboardShortcutService = inject(KeyboardShortcutService);
  public readonly workItemStore = inject(WorkItemStore);
  public readonly authService = inject(AuthService);

  public selectedWorkItems = signal<Set<string>>(new Set());
  public selectAllChecked = signal<boolean>(false);
  public bulkOperationInProgress = signal<boolean>(false);

  public hasSelection = computed(() => this.selectedWorkItems().size > 0);
  public selectionCount = computed(() => this.selectedWorkItems().size);
  public currentView = signal<'card' | 'table'>(
    this.sharedLocalStorageService.get<'card' | 'table'>('PageWorkItemsListComponent.currentView') || 'table',
  );
  public searchControl = new FormControl('');

  public typeFilter = new FormControl<WorkItemType[]>([]);
  public statusFilter = new FormControl<WorkItemStatus[]>([]);
  public priorityFilter = new FormControl<WorkItemPriority[]>([]);
  public selectedTagFilters = signal<string[]>([]);

  public readonly workItemTypes = Object.values(WorkItemType);
  public readonly workItemStatuses = Object.values(WorkItemStatus);
  public readonly workItemPriorities = Object.values(WorkItemPriority);

  public availableTagsWithCounts = computed<TagWithCount[]>(() => {
    const entities = this.workItemStore.entities();
    const tagCounts = new Map<string, number>();
    for (const item of entities) {
      for (const tag of item.tags ?? []) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => a.tag.localeCompare(b.tag));
  });

  public activeFilters = computed(() => {
    const filters: Array<{ field: string; value: string; label: string }> = [];

    const types = this.typeFilter.value;
    if (types && types.length > 0) {
      types.forEach((type) => {
        filters.push({ field: 'type', value: type, label: `Type: ${type}` });
      });
    }

    const statuses = this.statusFilter.value;
    if (statuses && statuses.length > 0) {
      statuses.forEach((status) => {
        filters.push({ field: 'status', value: status, label: `Status: ${status}` });
      });
    }

    const priorities = this.priorityFilter.value;
    if (priorities && priorities.length > 0) {
      priorities.forEach((priority) => {
        filters.push({ field: 'priority', value: priority, label: `Priority: ${priority}` });
      });
    }

    const tags = this.selectedTagFilters();
    if (tags.length > 0) {
      tags.forEach((tag) => {
        filters.push({ field: 'tags', value: tag, label: `Tag: ${tag}` });
      });
    }

    return filters;
  });

  private defaultColumnDefs: TableModels.ColumnDef<WorkItem>[] = [
    {
      field: 'id',
      headerName: 'ID',
      cellDataType: 'text',
      sortable: true,
      pinned: 'left',
      hide: true,
    },
    {
      field: 'title',
      headerName: 'Title',
      cellDataType: 'text',
      sortable: true,
      pinned: 'left',
    },
    {
      field: 'type',
      headerName: 'Type',
      cellDataType: 'text',
      sortable: true,
    },
    {
      field: 'status',
      headerName: 'Status',
      cellDataType: 'text',
      sortable: true,
    },
    {
      field: 'priority',
      headerName: 'Priority',
      cellDataType: 'text',
      sortable: true,
    },
    {
      field: 'assignee_id',
      headerName: 'Assignee',
      cellDataType: 'text',
      sortable: true,
    },
    {
      field: 'sprint_id',
      headerName: 'Sprint',
      cellDataType: 'text',
      sortable: true,
    },
    {
      field: 'story_points',
      headerName: 'Story Points',
      cellDataType: 'number',
      sortable: true,
    },
    {
      field: 'created_at',
      headerName: 'Created',
      cellDataType: 'date',
      sortable: true,
    },
    {
      field: 'updated_at',
      headerName: 'Updated',
      cellDataType: 'date',
      sortable: true,
    },
  ];

  columnDefs: TableModels.ColumnDef<WorkItem>[] = this.getColumnDefs();

  constructor() {
    // Persist view mode to local storage
    effect(() => {
      this.sharedLocalStorageService.set('PageWorkItemsListComponent.currentView', this.currentView());
    });

    this.searchControl.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.applyFilters();
    });

    this.typeFilter.valueChanges.subscribe(() => this.applyFilters());
    this.statusFilter.valueChanges.subscribe(() => this.applyFilters());
    this.priorityFilter.valueChanges.subscribe(() => this.applyFilters());
  }

  ngOnInit(): void {
    this.title.setTitle(`Sprint Management | Work Items | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({
      name: 'description',
      content: 'View and manage work items in the sprint management system.',
    });

    this.registerKeyboardShortcuts();

    this.workItemStore.clearFilters();

    if (!this.workItemStore.loaded() || this.workItemStore.entities().length === 0) {
      this.loadWorkItems();
    }
  }

  ngOnDestroy(): void {
    this.keyboardShortcutService.unregisterContext('Work Items');
  }

  private registerKeyboardShortcuts(): void {
    // 'c' - Create new work item
    this.keyboardShortcutService.register({
      id: 'work-items-create',
      key: 'c',
      description: 'Create new work item',
      context: 'Work Items',
      handler: () => {
        this.openCreateWorkItemDialog();
      },
    });

    // 'Ctrl+K' or 'Cmd+K' - Focus search
    this.keyboardShortcutService.register({
      id: 'work-items-search',
      key: 'Ctrl+K',
      description: 'Focus search',
      context: 'Work Items',
      handler: (event) => {
        event.preventDefault();
        // Focus the search input
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
    });

    // '?' - Show keyboard shortcuts help
    this.keyboardShortcutService.register({
      id: 'work-items-help',
      key: '?',
      description: 'Show keyboard shortcuts',
      context: 'Work Items',
      handler: () => {
        this.showKeyboardShortcuts();
      },
    });
  }

  private showKeyboardShortcuts(): void {
    this.dialog.open(KeyboardShortcutsDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
    });
  }

  private getColumnDefs(): TableModels.ColumnDef<WorkItem>[] {
    const storedColumnDefs: TableModels.ColumnDef<WorkItem>[] | null = this.sharedLocalStorageService.get(
      'PageWorkItemsListComponent.columnDefs',
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

  onColumnDefsChange(columnDefs: TableModels.ColumnDef<WorkItem>[]) {
    this.sharedLocalStorageService.set('PageWorkItemsListComponent.columnDefs', columnDefs);
  }

  onResetColumnDefsClicked() {
    this.columnDefs = [...this.defaultColumnDefs];
    this.sharedLocalStorageService.remove('PageWorkItemsListComponent.columnDefs');
  }

  private applyFilters(): void {
    const filters: FilterModel[] = [];

    // Search filter
    const searchQuery = this.searchControl.value;
    if (searchQuery && searchQuery.trim()) {
      filters.push({
        field: 'search',
        type: FilterType.Text,
        condition: FilterCondition.Contains,
        value: searchQuery.trim(),
      });
    }

    // Type filter
    const types = this.typeFilter.value;
    if (types && types.length > 0) {
      filters.push({
        field: 'type',
        type: FilterType.Set,
        condition: FilterCondition.Equals,
        value: types,
      });
    }

    // Status filter
    const statuses = this.statusFilter.value;
    if (statuses && statuses.length > 0) {
      filters.push({
        field: 'status',
        type: FilterType.Set,
        condition: FilterCondition.Equals,
        value: statuses,
      });
    }

    // Priority filter
    const priorities = this.priorityFilter.value;
    if (priorities && priorities.length > 0) {
      filters.push({
        field: 'priority',
        type: FilterType.Set,
        condition: FilterCondition.Equals,
        value: priorities,
      });
    }

    // Tag filter
    const tags = this.selectedTagFilters();
    if (tags.length > 0) {
      filters.push({
        field: 'tags',
        type: FilterType.Set,
        condition: FilterCondition.Equals,
        value: tags,
      });
    }

    this.workItemStore.setFilters({ filters, operator: 'AND' });

    // Reload with new filters
    this.loadWorkItems();
  }

  removeFilter(filter: { field: string; value: string }): void {
    if (filter.field === 'type') {
      const current = this.typeFilter.value || [];
      this.typeFilter.setValue(current.filter((v) => v !== (filter.value as WorkItemType)));
    } else if (filter.field === 'status') {
      const current = this.statusFilter.value || [];
      this.statusFilter.setValue(current.filter((v) => v !== (filter.value as WorkItemStatus)));
    } else if (filter.field === 'priority') {
      const current = this.priorityFilter.value || [];
      this.priorityFilter.setValue(current.filter((v) => v !== (filter.value as WorkItemPriority)));
    } else if (filter.field === 'tags') {
      this.selectedTagFilters.update((tags) => tags.filter((t) => t !== filter.value));
      this.applyFilters();
    }
  }

  clearAllFilters(): void {
    this.searchControl.setValue('');
    this.typeFilter.setValue([]);
    this.statusFilter.setValue([]);
    this.priorityFilter.setValue([]);
    this.selectedTagFilters.set([]);
    this.workItemStore.setFilters({ filters: [], operator: 'AND' });
  }

  clearAllSorting(): void {
    this.workItemStore.setSorts({ sorts: [] });
  }

  onTagFilterChanged(tags: string[]): void {
    this.selectedTagFilters.set(tags);
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.workItemStore.setPage(event.pageIndex + 1);
    this.workItemStore.setPageSize(event.pageSize);
  }

  onRowDoubleClicked(workItem: WorkItem): void {
    this.router.navigate(['/work-items', workItem.id]);
  }

  openCreateWorkItemDialog(): void {
    this.router.navigate(['/work-items/create']);
  }

  loadWorkItems(): void {
    const pagination = this.workItemStore.pagination();
    const filters = this.workItemStore.filters();
    const sorts = this.workItemStore.sorts();

    this.workItemStore.loadWorkItems({
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      filters: filters.filters,
      sort: sorts.sorts,
    });
  }

  // Bulk selection methods
  toggleSelectAll(): void {
    const allSelected = this.selectAllChecked();
    if (allSelected) {
      this.selectedWorkItems.set(new Set());
      this.selectAllChecked.set(false);
    } else {
      const allIds = new Set(this.workItemStore.entities().map((item) => item.id));
      this.selectedWorkItems.set(allIds);
      this.selectAllChecked.set(true);
    }
  }

  toggleSelectItem(itemId: string): void {
    const selected = new Set(this.selectedWorkItems());
    if (selected.has(itemId)) {
      selected.delete(itemId);
    } else {
      selected.add(itemId);
    }
    this.selectedWorkItems.set(selected);

    // Update select all checkbox state
    const allIds = this.workItemStore.entities().map((item) => item.id);
    this.selectAllChecked.set(allIds.every((id) => selected.has(id)));
  }

  isSelected(itemId: string): boolean {
    return this.selectedWorkItems().has(itemId);
  }

  clearSelection(): void {
    this.selectedWorkItems.set(new Set());
    this.selectAllChecked.set(false);
  }

  async bulkUpdateStatus(status: WorkItemStatus): Promise<void> {
    if (!this.hasSelection()) return;

    this.bulkOperationInProgress.set(true);
    const selectedIds = Array.from(this.selectedWorkItems());

    try {
      this.workItemStore.bulkUpdate({
        work_item_ids: selectedIds,
        updates: { status },
      });

      this.snackBar.open(`Updated ${selectedIds.length} work item(s) to status: ${status}`, 'Close', {
        duration: 3000,
      });

      this.clearSelection();
    } catch (_error) {
      this.snackBar.open('Failed to update work items', 'Close', {
        duration: 5000,
      });
    } finally {
      this.bulkOperationInProgress.set(false);
    }
  }

  async bulkUpdatePriority(priority: WorkItemPriority): Promise<void> {
    if (!this.hasSelection()) return;

    this.bulkOperationInProgress.set(true);
    const selectedIds = Array.from(this.selectedWorkItems());

    try {
      this.workItemStore.bulkUpdate({
        work_item_ids: selectedIds,
        updates: { priority },
      });

      this.snackBar.open(`Updated ${selectedIds.length} work item(s) to priority: ${priority}`, 'Close', {
        duration: 3000,
      });

      this.clearSelection();
    } catch (_error) {
      this.snackBar.open('Failed to update work items', 'Close', {
        duration: 5000,
      });
    } finally {
      this.bulkOperationInProgress.set(false);
    }
  }

  async bulkAssignToSprint(sprintId: string): Promise<void> {
    if (!this.hasSelection()) return;

    this.bulkOperationInProgress.set(true);
    const selectedIds = Array.from(this.selectedWorkItems());

    try {
      this.workItemStore.bulkUpdate({
        work_item_ids: selectedIds,
        updates: { sprint_id: sprintId },
      });

      this.snackBar.open(`Assigned ${selectedIds.length} work item(s) to sprint`, 'Close', { duration: 3000 });

      this.clearSelection();
    } catch (_error) {
      this.snackBar.open('Failed to assign work items to sprint', 'Close', {
        duration: 5000,
      });
    } finally {
      this.bulkOperationInProgress.set(false);
    }
  }

  async bulkDelete(): Promise<void> {
    if (!this.hasSelection()) return;

    const selectedIds = Array.from(this.selectedWorkItems());
    const confirmed = confirm(
      `Are you sure you want to delete ${selectedIds.length} work item(s)? This action cannot be undone.`,
    );

    if (!confirmed) return;

    this.bulkOperationInProgress.set(true);

    try {
      for (const id of selectedIds) {
        this.workItemStore.delete(id);
      }

      this.snackBar.open(`Deleted ${selectedIds.length} work item(s)`, 'Close', { duration: 3000 });

      this.clearSelection();
    } catch (_error) {
      this.snackBar.open('Failed to delete work items', 'Close', {
        duration: 5000,
      });
    } finally {
      this.bulkOperationInProgress.set(false);
    }
  }

  exportToCSV(): void {
    const pagination = this.workItemStore.pagination();
    const filters = this.workItemStore.filters();
    const sorts = this.workItemStore.sorts();

    this.apiService
      .exportWorkItems('csv', {
        page: pagination.currentPage,
        page_size: pagination.pageSize,
        filters: filters.filters,
        sort: sorts.sorts,
      })
      .subscribe({
        next: (blob) => {
          this.downloadFile(blob, 'work-items.csv');
          this.snackBar.open('Work items exported to CSV', 'Close', {
            duration: 3000,
          });
        },
        error: (_error) => {
          this.snackBar.open('Failed to export work items', 'Close', {
            duration: 5000,
          });
        },
      });
  }

  exportToJSON(): void {
    const pagination = this.workItemStore.pagination();
    const filters = this.workItemStore.filters();
    const sorts = this.workItemStore.sorts();

    this.apiService
      .exportWorkItems('json', {
        page: pagination.currentPage,
        page_size: pagination.pageSize,
        filters: filters.filters,
        sort: sorts.sorts,
      })
      .subscribe({
        next: (blob) => {
          this.downloadFile(blob, 'work-items.json');
          this.snackBar.open('Work items exported to JSON', 'Close', {
            duration: 3000,
          });
        },
        error: (_error) => {
          this.snackBar.open('Failed to export work items', 'Close', {
            duration: 5000,
          });
        },
      });
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
