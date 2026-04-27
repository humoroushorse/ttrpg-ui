import { ChangeDetectionStrategy, Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { DisplayValuePipe, IsEmptyValuePipe } from '@ttrpg-ui/shared/util';
import {
  TagChipComponent,
  WorkItemLinkListComponent,
  WorkItemLinkDialogComponent,
  AuditLogListComponent,
} from '@ttrpg-ui/features/sprint-management/ui';
import { WorkItemDialogComponent } from '@ttrpg-ui/features/sprint-management/ui';

import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';

import {
  WorkItemStore,
  CommentStore,
  DependencyStore,
  AuditLogStore,
  WorkItemLinkStore,
} from '@ttrpg-ui/features/sprint-management/data-access';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { WorkItemType, WorkItemStatus, WorkItemPriority } = SprintModels.WorkItem;
type WorkItemType = SprintModels.WorkItem.WorkItemType;
type WorkItemStatus = SprintModels.WorkItem.WorkItemStatus;
type WorkItemPriority = SprintModels.WorkItem.WorkItemPriority;

@Component({
  selector: 'lib-page-work-item-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatSnackBarModule,
    MatDialogModule,
    TagChipComponent,
    WorkItemLinkListComponent,
    AuditLogListComponent,
    DisplayValuePipe,
    IsEmptyValuePipe,
    RouterLink,
  ],
  templateUrl: './page-work-item-detail.component.html',
  styleUrls: ['./page-work-item-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageWorkItemDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly sharedCoreService = inject(SharedCoreService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  public readonly workItemStore = inject(WorkItemStore);
  public readonly commentStore = inject(CommentStore);
  public readonly dependencyStore = inject(DependencyStore);
  public readonly auditLogStore = inject(AuditLogStore);
  public readonly authService = inject(AuthService);

  public readonly workItemLinkStore = inject(WorkItemLinkStore);

  public workItemId = signal<string | null>(null);

  public workItem = computed(() => {
    const id = this.workItemId();
    if (!id) return null;
    return this.workItemStore.entityMap()[id] || null;
  });

  public loading = computed(() => {
    return this.workItemStore.loading();
  });

  public error = computed(() => {
    return (
      this.workItemStore.error() ||
      this.commentStore.error() ||
      this.dependencyStore.error() ||
      this.auditLogStore.error()
    );
  });

  public comments = computed(() => {
    return this.commentStore.entities();
  });

  public dependencies = computed(() => {
    return this.dependencyStore.entities();
  });

  public auditLogs = computed(() => {
    return this.auditLogStore.filteredLogs();
  });

  public blocksDependencies = computed(() => {
    const workItemId = this.workItemId();
    if (!workItemId) return [];
    return this.dependencies().filter(
      (dep) => dep.source_work_item_id === workItemId && dep.dependency_type === 'blocks',
    );
  });

  public blockedByDependencies = computed(() => {
    const workItemId = this.workItemId();
    if (!workItemId) return [];
    return this.dependencies().filter(
      (dep) => dep.target_work_item_id === workItemId && dep.dependency_type === 'blocked_by',
    );
  });

  public isBlocked = computed(() => {
    return this.blockedByDependencies().length > 0;
  });

  public readonly WorkItemType = WorkItemType;
  public readonly WorkItemStatus = WorkItemStatus;
  public readonly WorkItemPriority = WorkItemPriority;

  // Make Object available in template
  public readonly Object = Object;

  constructor() {
    // Load work item when ID changes
    effect(() => {
      const id = this.workItemId();
      if (id) {
        this.loadWorkItemData(id);
      }
    });

    // Update page title when work item loads
    effect(() => {
      const workItem = this.workItem();
      if (workItem) {
        this.title.setTitle(`${workItem.title} | Work Items | Sprint Management | ${this.sharedCoreService.appTitle}`);
        this.meta.updateTag({
          name: 'description',
          content: workItem.description || 'View work item details',
        });
      }
    });

    // Show error notifications
    effect(() => {
      const error = this.error();
      if (error) {
        this.snackBar.open(error, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.workItemId.set(id);
    } else {
      this.router.navigate(['/work-items']);
    }
  }

  // Track which tabs have been loaded
  private loadedTabs = new Set<number>();

  private loadWorkItemData(workItemId: string): void {
    this.workItemStore.loadWorkItem(workItemId);
    this.workItemLinkStore.loadLinks(workItemId);
    // Tab data is loaded lazily on first tab visit
    this.loadedTabs.clear();
  }

  onTabChange(index: number): void {
    const id = this.workItemId();
    if (!id || this.loadedTabs.has(index)) return;
    this.loadedTabs.add(index);

    switch (index) {
      case 1: // Dependencies
        this.dependencyStore.loadDependencies(id);
        break;
      case 2: // Comments
        this.commentStore.loadComments(id);
        break;
      case 3: // History
        this.auditLogStore.loadAuditLogs({ entity_type: 'work_item', entity_id: id });
        break;
    }
  }

  onEditClicked(): void {
    const id = this.workItemId();
    if (id) {
      this.router.navigate(['/work-items', id, 'edit']);
    }
  }

  onDeleteClicked(): void {
    const workItem = this.workItem();
    if (!workItem) return;

    const confirmed = confirm(
      `Are you sure you want to delete work item "${workItem.title}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    this.workItemStore.delete(workItem.id);

    this.snackBar.open('Work item deleted successfully', 'Close', {
      duration: 3000,
    });
    this.router.navigate(['/work-items']);
  }

  onBackClicked(): void {
    this.router.navigate(['/work-items']);
  }

  onCloneClicked(): void {
    const id = this.workItemId();
    if (!id) return;
    const clonedData = this.workItemStore.cloneWorkItem(id);
    if (!clonedData) return;

    const dialogRef = this.dialog.open(WorkItemDialogComponent, {
      width: '700px',
      data: { initialData: clonedData, title: 'Clone Work Item' },
    });

    const sub = dialogRef.afterClosed().subscribe((request: SprintModels.Api.CreateWorkItemRequest | undefined) => {
      if (request) {
        this.workItemStore.create(request);
        this.snackBar.open('Work item cloned successfully', 'Close', { duration: 3000 });
      }
      sub.unsubscribe();
    });
  }

  onAddLinkClicked(): void {
    const id = this.workItemId();
    if (!id) return;

    const dialogRef = this.dialog.open(WorkItemLinkDialogComponent, {
      width: '480px',
      data: { sourceWorkItemId: id },
    });

    const sub = dialogRef
      .afterClosed()
      .subscribe((request: SprintModels.WorkItemLink.CreateWorkItemLinkRequest | undefined) => {
        if (request) {
          this.workItemLinkStore.createLink(request);
        }
        sub.unsubscribe();
      });
  }

  onDeleteLink(linkId: string): void {
    this.workItemLinkStore.deleteLink(linkId);
  }

  onAuditLogFilterChange(filter: SprintModels.AuditLog.AuditLogFilter): void {
    this.auditLogStore.filterAuditLogs(filter);
  }

  getStatusColor(status: WorkItemStatus): string {
    switch (status) {
      case WorkItemStatus.Done:
        return 'primary';
      case WorkItemStatus.InProgress:
        return 'accent';
      case WorkItemStatus.InReview:
        return 'warn';
      case WorkItemStatus.Todo:
        return '';
      case WorkItemStatus.Backlog:
        return '';
      default:
        return '';
    }
  }

  getPriorityColor(priority: WorkItemPriority): string {
    switch (priority) {
      case WorkItemPriority.Critical:
        return 'warn';
      case WorkItemPriority.High:
        return 'accent';
      case WorkItemPriority.Medium:
        return '';
      case WorkItemPriority.Low:
        return '';
      default:
        return '';
    }
  }

  getTypeIcon(type: WorkItemType): string {
    switch (type) {
      case WorkItemType.Story:
        return 'book';
      case WorkItemType.Defect:
        return 'bug_report';
      case WorkItemType.Epic:
        return 'flag';
      default:
        return 'work';
    }
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '--';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '--';
    return date.toLocaleString();
  }

  getAuditLogActionIcon(action: string): string {
    switch (action) {
      case 'created':
        return 'add_circle';
      case 'updated':
        return 'edit';
      case 'deleted':
        return 'delete';
      case 'status_changed':
        return 'swap_horiz';
      default:
        return 'history';
    }
  }

  getAuditLogActionColor(action: string): string {
    switch (action) {
      case 'created':
        return 'primary';
      case 'updated':
        return 'accent';
      case 'deleted':
        return 'warn';
      default:
        return '';
    }
  }
}
