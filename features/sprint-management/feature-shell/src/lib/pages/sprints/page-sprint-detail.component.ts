import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { SprintBoardComponent } from '@ttrpg-ui/features/sprint-management/ui';

import { SprintStore, WorkItemStore, WebSocketService } from '@ttrpg-ui/features/sprint-management/data-access';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { SprintStatus } = SprintModels.Sprint;
const { WorkItemStatus } = SprintModels.WorkItem;
const { FilterType, FilterCondition } = SprintModels.Filter;
type SprintStatus = SprintModels.Sprint.SprintStatus;
type WorkItemStatus = SprintModels.WorkItem.WorkItemStatus;

@Component({
  selector: 'lib-page-sprint-detail',
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
    MatProgressBarModule,
    MatTabsModule,
    MatSnackBarModule,
    SprintBoardComponent,
  ],
  templateUrl: './page-sprint-detail.component.html',
  styleUrls: ['./page-sprint-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageSprintDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly sharedCoreService = inject(SharedCoreService);
  private readonly snackBar = inject(MatSnackBar);
  public readonly sprintStore = inject(SprintStore);
  public readonly workItemStore = inject(WorkItemStore);
  public readonly authService = inject(AuthService);
  private readonly wsService = inject(WebSocketService);
  private readonly platformId = inject(PLATFORM_ID);

  public sprintId = signal<string | null>(null);

  public sprint = computed(() => {
    const id = this.sprintId();
    if (!id) return null;
    return this.sprintStore.entityMap()[id] || null;
  });

  public loading = computed(() => {
    return this.sprintStore.loading() || this.workItemStore.loading();
  });

  public error = computed(() => {
    return this.sprintStore.error() || this.workItemStore.error();
  });

  public sprintWorkItems = computed(() => {
    const sprintId = this.sprintId();
    if (!sprintId) return [];
    return this.workItemStore.entities().filter((item) => item.sprint_id === sprintId);
  });

  public totalItems = computed(() => this.sprintWorkItems().length);

  public completedItems = computed(() => {
    return this.sprintWorkItems().filter((item) => item.status === WorkItemStatus.Done).length;
  });

  public inProgressItems = computed(() => {
    return this.sprintWorkItems().filter((item) => item.status === WorkItemStatus.InProgress).length;
  });

  public blockedItems = computed(() => {
    // A work item is considered blocked if it has blocking dependencies
    // For now, we'll count items in a "blocked" state if we had one
    // Since we don't have a blocked status, we'll return 0
    // This would need to be enhanced with dependency checking
    return 0;
  });

  public remainingItems = computed(() => {
    return this.totalItems() - this.completedItems();
  });

  public completionPercentage = computed(() => {
    const total = this.totalItems();
    if (total === 0) return 0;
    return Math.round((this.completedItems() / total) * 100);
  });

  public totalStoryPoints = computed(() => {
    return this.sprintWorkItems().reduce((sum, item) => sum + (item.story_points || 0), 0);
  });

  public completedStoryPoints = computed(() => {
    return this.sprintWorkItems()
      .filter((item) => item.status === WorkItemStatus.Done)
      .reduce((sum, item) => sum + (item.story_points || 0), 0);
  });

  public canStartSprint = computed(() => {
    const sprint = this.sprint();
    return sprint?.status === SprintStatus.Planning;
  });

  public canCompleteSprint = computed(() => {
    const sprint = this.sprint();
    return sprint?.status === SprintStatus.Active;
  });

  public readonly SprintStatus = SprintStatus;
  public readonly WorkItemStatus = WorkItemStatus;

  private lastErrorShown = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.sprintId();
      if (id && isPlatformBrowser(this.platformId)) {
        this.loadSprintData(id);
      }
    });

    effect(() => {
      const sprint = this.sprint();
      if (sprint) {
        this.title.setTitle(`${sprint.name} | Sprints | Sprint Management | ${this.sharedCoreService.appTitle}`);
        this.meta.updateTag({
          name: 'description',
          content: sprint.description || 'View sprint details',
        });
      }
    });

    // Show error notifications (only once per error)
    effect(() => {
      const error = this.error();
      const lastError = this.lastErrorShown();

      if (error && error !== lastError) {
        this.lastErrorShown.set(error);
        this.snackBar.open(error, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar'],
        });
      } else if (!error && lastError) {
        // Clear last error when error is cleared
        this.lastErrorShown.set(null);
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.sprintId.set(id);

      // Connect to WebSocket and join sprint room
      this.wsService.connect();
      this.wsService.joinRoom(`sprint:${id}`);

      // Listen for work item updates
      this.wsService.getMessagesByType('work_item.created').subscribe((msg) => {
        this.workItemStore.handleWorkItemCreated(msg.data);
      });

      this.wsService.getMessagesByType('work_item.updated').subscribe((msg) => {
        this.workItemStore.handleWorkItemUpdated(msg.data);
      });

      this.wsService.getMessagesByType('work_item.deleted').subscribe((msg) => {
        this.workItemStore.handleWorkItemDeleted(msg.data.id);
      });
    } else {
      this.router.navigate(['/sprints']);
    }
  }

  ngOnDestroy(): void {
    this.wsService.leaveRoom();
    this.wsService.disconnect();
  }

  private loadSprintData(sprintId: string): void {
    this.sprintStore.loadSprint(sprintId);

    this.workItemStore.loadWorkItems({
      page: 1,
      page_size: 1000, // Load all items for the sprint
      filters: [
        {
          field: 'sprint_id',
          type: FilterType.Text,
          condition: FilterCondition.Equals,
          value: sprintId,
        },
      ],
      sort: [],
    });
  }

  onEditClicked(): void {
    const id = this.sprintId();
    if (id) {
      this.router.navigate(['/sprints', id, 'edit']);
    }
  }

  onDeleteClicked(): void {
    const sprint = this.sprint();
    if (!sprint) return;

    const confirmed = confirm(`Are you sure you want to delete sprint "${sprint.name}"? This action cannot be undone.`);

    if (!confirmed) return;

    this.sprintStore.delete(sprint.id);

    // Navigate back to list after deletion
    this.snackBar.open('Sprint deleted successfully', 'Close', {
      duration: 3000,
    });
    this.router.navigate(['/sprints']);
  }

  onStartSprintClicked(): void {
    const sprint = this.sprint();
    if (!sprint) return;

    const confirmed = confirm(
      `Are you sure you want to start sprint "${sprint.name}"? This will change its status to Active.`,
    );

    if (!confirmed) return;

    this.sprintStore.startSprint(sprint.id);

    // Reload sprint data to ensure we have the latest status
    setTimeout(() => {
      this.loadSprintData(sprint.id);
    }, 500);

    this.snackBar.open('Sprint started successfully', 'Close', {
      duration: 3000,
    });
  }

  onCompleteSprintClicked(): void {
    const sprint = this.sprint();
    if (!sprint) return;

    const confirmed = confirm(
      `Are you sure you want to complete sprint "${sprint.name}"? This will change its status to Completed.`,
    );

    if (!confirmed) return;

    this.sprintStore.completeSprint(sprint.id);

    this.snackBar.open('Sprint completed successfully', 'Close', {
      duration: 3000,
    });
  }

  onBackClicked(): void {
    this.router.navigate(['/sprints']);
  }

  onWorkItemClicked(workItemId: string): void {
    this.router.navigate(['/work-items', workItemId]);
  }

  onWorkItemStatusChanged(event: { id: string; status: WorkItemStatus }): void {
    // Track the current error state before update
    const errorBefore = this.workItemStore.error();

    this.workItemStore.update({
      id: event.id,
      status: event.status,
    });

    // Check error state after a short delay to see if update failed
    setTimeout(() => {
      const errorAfter = this.workItemStore.error();

      // Only show success notification if no new error occurred
      if (errorAfter === errorBefore || !errorAfter) {
        this.snackBar.open('Work item status updated', 'Close', {
          duration: 2000,
        });
      } else {
        // Show error notification
        this.snackBar.open(this.workItemStore.errorSummary() || errorAfter || 'Failed to update work item', 'Close', {
          duration: 3000,
        });
      }
    }, 100);
  }

  getStatusColor(status: SprintStatus): string {
    switch (status) {
      case SprintStatus.Active:
        return 'primary';
      case SprintStatus.Completed:
        return 'accent';
      case SprintStatus.Cancelled:
        return 'warn';
      case SprintStatus.Planning:
        return '';
      default:
        return '';
    }
  }

  getWorkItemStatusColor(status: WorkItemStatus): string {
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  getDaysRemaining(): number {
    const sprint = this.sprint();
    if (!sprint) return 0;

    const endDate = new Date(sprint.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  getSprintDuration(): number {
    const sprint = this.sprint();
    if (!sprint) return 0;

    const startDate = new Date(sprint.start_date);
    const endDate = new Date(sprint.end_date);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }
}
