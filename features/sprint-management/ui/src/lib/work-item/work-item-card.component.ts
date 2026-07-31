import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';
import { TagChipComponent } from '../advanced/tag-chip.component';

const { WorkItemStatus } = SprintModels.WorkItem;
type WorkItem = SprintModels.WorkItem.WorkItem;
type WorkItemStatus = SprintModels.WorkItem.WorkItemStatus;

@Component({
  selector: 'lib-work-item-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    TagChipComponent,
  ],
  templateUrl: './work-item-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './work-item-card.component.scss',
})
export class WorkItemCardComponent {
  workItem = input.required<WorkItem>();

  cardClicked = output<WorkItem>();
  viewClicked = output<WorkItem>();
  editClicked = output<WorkItem>();

  onCardClick(): void {
    this.cardClicked.emit(this.workItem());
  }

  onViewClick(event: Event): void {
    event.stopPropagation();
    this.viewClicked.emit(this.workItem());
  }

  onEditClick(event: Event): void {
    event.stopPropagation();
    this.editClicked.emit(this.workItem());
  }

  getPriorityColor(): string {
    const item = this.workItem();
    switch (item.priority) {
      case 'critical':
        return 'priority-critical';
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-default';
    }
  }

  getTypeIcon(): string {
    const item = this.workItem();
    switch (item.type) {
      case 'story':
        return 'book';
      case 'defect':
        return 'bug_report';
      case 'epic':
        return 'flag';
      default:
        return 'work';
    }
  }

  getStatusColor(): string {
    const item = this.workItem();
    switch (item.status) {
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
  }

  getTicketNumber(): string {
    const item = this.workItem();
    if (item.project_key && item.ticket_number) {
      return `${item.project_key}-${item.ticket_number}`;
    }
    return item.ticket_number ? `#${item.ticket_number}` : '';
  }

  formatHours(hours: number | null | undefined): string {
    if (hours === null || hours === undefined) {
      return '--';
    }
    return `${hours}h`;
  }
}
