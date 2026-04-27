import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  Type,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { debounceTime } from 'rxjs';

import { SharedAngularMaterialTableComponent } from '@ttrpg-ui/shared/table/ui';
import { TableModels } from '@ttrpg-ui/shared/table/models';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { KeyboardShortcutService } from '@ttrpg-ui/shared/keyboard-shortcut/data-access';
import { KeyboardShortcutsDialogComponent } from '@ttrpg-ui/shared/keyboard-shortcut/ui';

import { SprintStore } from '@ttrpg-ui/features/sprint-management/data-access';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { SprintStatus } = SprintModels.Sprint;
const { FilterType, FilterCondition } = SprintModels.Filter;
type Sprint = SprintModels.Sprint.Sprint;
type SprintStatus = SprintModels.Sprint.SprintStatus;
type FilterModel = SprintModels.Filter.FilterModel;

@Component({
  selector: 'lib-page-sprints-list',
  standalone: true,
  imports: [
    CommonModule,
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
    MatSnackBarModule,
    MatDialogModule,
    ScrollingModule,
  ],
  templateUrl: './page-sprints-list.component.html',
  styleUrls: ['./page-sprints-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageSprintsListComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly sharedCoreService = inject(SharedCoreService);
  private readonly sharedLocalStorageService = inject(SharedLocalStorageService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly keyboardShortcutService = inject(KeyboardShortcutService);
  public readonly sprintStore = inject(SprintStore);
  public readonly authService = inject(AuthService);
  public currentView = signal<'card' | 'table'>(
    this.sharedLocalStorageService.get<'card' | 'table'>(
      'PageSprintsListComponent.currentView'
    ) || 'card'
  );
  public searchControl = new FormControl('');
  public statusFilter = new FormControl<SprintStatus[]>([]);
  public readonly sprintStatuses = Object.values(SprintStatus);
  public activeFilters = computed(() => {
    const filters: Array<{ field: string; value: string; label: string }> = [];

    const statuses = this.statusFilter.value;
    if (statuses && statuses.length > 0) {
      statuses.forEach((status) => {
        filters.push({ field: 'status', value: status, label: `Status: ${status}` });
      });
    }

    return filters;
  });
  private defaultColumnDefs: TableModels.ColumnDef<Sprint>[] = [
    {
      field: 'id',
      headerName: 'ID',
      cellDataType: 'text',
      sortable: true,
      pinned: 'left',
      hide: true,
    },
    {
      field: 'name',
      headerName: 'Name',
      cellDataType: 'text',
      sortable: true,
      pinned: 'left',
    },
    {
      field: 'status',
      headerName: 'Status',
      cellDataType: 'text',
      sortable: true,
    },
    {
      field: 'start_date',
      headerName: 'Start Date',
      cellDataType: 'date',
      sortable: true,
    },
    {
      field: 'end_date',
      headerName: 'End Date',
      cellDataType: 'date',
      sortable: true,
    },
    {
      field: 'goal',
      headerName: 'Goal',
      cellDataType: 'text',
      sortable: false,
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

  columnDefs: TableModels.ColumnDef<Sprint>[] = this.getColumnDefs();

  constructor() {
    // Persist view mode to local storage
    effect(() => {
      this.sharedLocalStorageService.set(
        'PageSprintsListComponent.currentView',
        this.currentView()
      );
    });
    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.applyFilters();
      });
    this.statusFilter.valueChanges.subscribe(() => this.applyFilters());
  }

  ngOnInit(): void {
    this.title.setTitle(
      `Sprint Management | Sprints | ${this.sharedCoreService.appTitle}`
    );
    this.meta.updateTag({
      name: 'description',
      content: 'View and manage sprints in the sprint management system.',
    });

    this.registerKeyboardShortcuts();

    this.sprintStore.clearFilters();

    if (!this.sprintStore.loaded() || this.sprintStore.entities().length === 0) {
      this.loadSprints();
    }
  }

  ngOnDestroy(): void {
    this.keyboardShortcutService.unregisterContext('Sprints');
  }

  private registerKeyboardShortcuts(): void {
    // 's' - Create new sprint
    this.keyboardShortcutService.register({
      id: 'sprints-create',
      key: 's',
      description: 'Create new sprint',
      context: 'Sprints',
      handler: () => {
        this.openCreateSprintDialog();
      },
    });

    // 'Ctrl+K' or 'Cmd+K' - Focus search
    this.keyboardShortcutService.register({
      id: 'sprints-search',
      key: 'Ctrl+K',
      description: 'Focus search',
      context: 'Sprints',
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
      id: 'sprints-help',
      key: '?',
      description: 'Show keyboard shortcuts',
      context: 'Sprints',
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

  private getColumnDefs(): TableModels.ColumnDef<Sprint>[] {
    const storedColumnDefs: TableModels.ColumnDef<Sprint>[] | null =
      this.sharedLocalStorageService.get('PageSprintsListComponent.columnDefs');

    if (storedColumnDefs) {
      return storedColumnDefs.map((c) => {
        if (c.cellDataType === 'component') {
          return {
            ...c,
            component: this.defaultColumnDefs.find((d) => d.field === c.field)
              ?.component as Type<unknown>,
          };
        }
        return c;
      });
    }
    return [...this.defaultColumnDefs];
  }

  onColumnDefsChange(columnDefs: TableModels.ColumnDef<Sprint>[]) {
    this.sharedLocalStorageService.set(
      'PageSprintsListComponent.columnDefs',
      columnDefs
    );
  }

  onResetColumnDefsClicked() {
    this.columnDefs = [...this.defaultColumnDefs];
    this.sharedLocalStorageService.remove('PageSprintsListComponent.columnDefs');
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

    this.sprintStore.setFilters({ filters, operator: 'AND' });

    // Reload with new filters
    this.loadSprints();
  }

  removeFilter(filter: { field: string; value: string }): void {
    if (filter.field === 'status') {
      const current = this.statusFilter.value || [];
      this.statusFilter.setValue(
        current.filter((v) => v !== (filter.value as SprintStatus))
      );
    }
  }

  clearAllFilters(): void {
    this.searchControl.setValue('');
    this.statusFilter.setValue([]);
    this.sprintStore.setFilters({ filters: [], operator: 'AND' });
  }

  clearAllSorting(): void {
    this.sprintStore.setSorts({ sorts: [] });
  }

  onPageChange(event: PageEvent): void {
    this.sprintStore.setPage(event.pageIndex + 1);
    this.sprintStore.setPageSize(event.pageSize);
  }

  onRowDoubleClicked(sprint: Sprint): void {
    this.router.navigate(['/sprints', sprint.id]);
  }

  openCreateSprintDialog(): void {
    this.router.navigate(['/sprints/create']);
  }

  loadSprints(): void {
    const pagination = this.sprintStore.pagination();
    const filters = this.sprintStore.filters();
    const sorts = this.sprintStore.sorts();

    this.sprintStore.loadSprints({
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      filters: filters.filters,
      sort: sorts.sorts,
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getStatusClass(status: SprintStatus): string {
    switch (status) {
      case SprintStatus.Planning:
        return 'status-planning';
      case SprintStatus.Active:
        return 'status-active';
      case SprintStatus.Completed:
        return 'status-completed';
      case SprintStatus.Cancelled:
        return 'status-cancelled';
      default:
        return '';
    }
  }
}
