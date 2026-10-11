import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { SprintBoardComponent } from '@ttrpg-ui/features/sprint-management/ui';

import { SprintStore, WorkItemStore } from '@ttrpg-ui/features/sprint-management/data-access';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { SprintStatus } = SprintModels.Sprint;
const { FilterType, FilterCondition } = SprintModels.Filter;
type SprintStatus = SprintModels.Sprint.SprintStatus;
type WorkItemStatus = SprintModels.WorkItem.WorkItemStatus;

@Component({
  selector: 'lib-page-board',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    SprintBoardComponent,
  ],
  templateUrl: './page-board.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./page-board.component.scss'],
})
export class PageBoardComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly sharedCoreService = inject(SharedCoreService);
  private readonly snackBar = inject(MatSnackBar);
  public readonly sprintStore = inject(SprintStore);
  public readonly workItemStore = inject(WorkItemStore);
  public readonly authService = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);

  public selectedSprintId = signal<string | null>(null);

  // Active sprint (status = Active)
  public activeSprint = computed(() => {
    const sprints = this.sprintStore.entities();
    const active = sprints.find((s) => s.status === SprintStatus.Active);
    return active || null;
  });

  public availableSprints = computed(() => {
    return this.sprintStore
      .entities()
      .filter((s) => s.status === SprintStatus.Active || s.status === SprintStatus.Planning);
  });

  public currentSprint = computed(() => {
    const id = this.selectedSprintId();
    if (!id) return null;
    return this.sprintStore.entityMap()[id] || null;
  });

  public sprintWorkItems = computed(() => {
    const sprintId = this.selectedSprintId();
    if (!sprintId) return [];

    return this.workItemStore.entities().filter((item) => item.sprint_id === sprintId);
  });

  public loading = computed(() => {
    return this.sprintStore.loading() || this.workItemStore.loading();
  });

  public readonly SprintStatus = SprintStatus;

  constructor() {
    // Auto-select active sprint when it loads
    effect(() => {
      const active = this.activeSprint();
      const selected = this.selectedSprintId();

      if (active && !selected) {
        this.selectedSprintId.set(active.id);
      }
    });

    // Load work items when sprint changes
    effect(() => {
      const sprintId = this.selectedSprintId();
      if (sprintId) {
        this.loadWorkItemsForSprint(sprintId);
      }
    });
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.title.setTitle(`Sprint Management | Board | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({
      name: 'description',
      content: 'Sprint board - Manage work items with drag and drop.',
    });

    // Load active sprints
    this.sprintStore.loadSprints({
      page: 1,
      page_size: 10,
      filters: [
        {
          field: 'status',
          type: FilterType.Text,
          condition: FilterCondition.Equals,
          value: SprintStatus.Active,
        },
      ],
      sort: [],
    });
  }

  private loadWorkItemsForSprint(sprintId: string): void {
    this.workItemStore.loadWorkItems({
      page: 1,
      page_size: 1000,
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

  onSprintChange(sprintId: string): void {
    this.selectedSprintId.set(sprintId);
  }

  onWorkItemClicked(workItemId: string): void {
    this.router.navigate(['/work-items', workItemId]);
  }

  onWorkItemStatusChanged(event: { id: string; status: WorkItemStatus }): void {
    const errorBefore = this.workItemStore.error();

    this.workItemStore.update({
      id: event.id,
      status: event.status,
    });

    setTimeout(() => {
      const errorAfter = this.workItemStore.error();

      // Only show success notification if no new error occurred
      if (errorAfter === errorBefore || !errorAfter) {
        this.snackBar.open('Work item status updated', 'Close', {
          duration: 2000,
        });
      } else {
        this.snackBar.open(this.workItemStore.errorSummary() || errorAfter || 'Failed to update work item', 'Close', {
          duration: 3000,
        });
      }
    }, 100);
  }

  onViewSprintDetails(): void {
    const sprintId = this.selectedSprintId();
    if (sprintId) {
      this.router.navigate(['/sprints', sprintId]);
    }
  }
}
