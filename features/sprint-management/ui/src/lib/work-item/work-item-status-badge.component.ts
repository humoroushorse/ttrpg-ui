import { Component, computed, input } from '@angular/core';

import { MatChipsModule } from '@angular/material/chips';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { WorkItemStatus } = SprintModels.WorkItem;
type WorkItemStatus = SprintModels.WorkItem.WorkItemStatus;

@Component({
  selector: 'lib-work-item-status-badge',
  standalone: true,
  imports: [MatChipsModule],
  templateUrl: './work-item-status-badge.component.html',
  styleUrl: './work-item-status-badge.component.scss',
})
export class WorkItemStatusBadgeComponent {
  status = input.required<WorkItemStatus>();

  colorClass = computed(() => {
    switch (this.status()) {
      case WorkItemStatus.Done:
        return 'status-done';
      case WorkItemStatus.InProgress:
        return 'status-in-progress';
      case WorkItemStatus.InReview:
        return 'status-in-review';
      case WorkItemStatus.Todo:
        return 'status-todo';
      case WorkItemStatus.Backlog:
        return 'status-backlog';
      default:
        return 'status-default';
    }
  });
}
