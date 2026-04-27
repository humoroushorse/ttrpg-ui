import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { WorkItemStatus } = SprintModels.WorkItem;
type WorkItem = SprintModels.WorkItem.WorkItem;
type WorkItemStatus = SprintModels.WorkItem.WorkItemStatus;

@Component({
  selector: 'lib-sprint-board',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatButtonModule,
  ],
  templateUrl: './sprint-board.component.html',
  styleUrls: ['./sprint-board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SprintBoardComponent {
  workItems = input.required<WorkItem[]>();
  workItemClicked = output<string>();
  workItemStatusChanged = output<{ id: string; status: WorkItemStatus }>();

  columns = [
    { id: 'todo', status: WorkItemStatus.Todo, title: 'To Do', icon: 'radio_button_unchecked' },
    { id: 'in-progress', status: WorkItemStatus.InProgress, title: 'In Progress', icon: 'hourglass_empty' },
    { id: 'in-review', status: WorkItemStatus.InReview, title: 'In Review', icon: 'rate_review' },
    { id: 'done', status: WorkItemStatus.Done, title: 'Done', icon: 'check_circle' },
  ];

  todoItems = computed(() => this.workItems().filter((item) => item.status === WorkItemStatus.Todo));

  inProgressItems = computed(() => this.workItems().filter((item) => item.status === WorkItemStatus.InProgress));

  inReviewItems = computed(() => this.workItems().filter((item) => item.status === WorkItemStatus.InReview));

  doneItems = computed(() => this.workItems().filter((item) => item.status === WorkItemStatus.Done));

  // Get items for a specific column
  getColumnItems(columnId: string): WorkItem[] {
    const column = this.columns.find((c) => c.id === columnId);
    if (!column) return [];

    switch (column.status) {
      case WorkItemStatus.Todo:
        return this.todoItems();
      case WorkItemStatus.InProgress:
        return this.inProgressItems();
      case WorkItemStatus.InReview:
        return this.inReviewItems();
      case WorkItemStatus.Done:
        return this.doneItems();
      default:
        return [];
    }
  }

  // Get connected drop lists (all columns except current)
  getConnectedLists(currentColumnId: string): string[] {
    return this.columns.filter((c) => c.id !== currentColumnId).map((c) => c.id);
  }

  // Handle drag and drop
  onDrop(event: CdkDragDrop<WorkItem[]>, columnId: string) {
    const column = this.columns.find((c) => c.id === columnId);
    if (!column) return;

    const item = event.item.data as WorkItem;

    if (item.status !== column.status) {
      // Status changed - emit event
      this.workItemStatusChanged.emit({
        id: item.id,
        status: column.status,
      });
    }
  }

  onWorkItemClick(id: string) {
    this.workItemClicked.emit(id);
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'story':
        return 'book';
      case 'defect':
        return 'bug_report';
      case 'epic':
        return 'flag';
      default:
        return 'assignment';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'Critical':
        return 'warn';
      case 'High':
        return 'accent';
      case 'Medium':
        return 'primary';
      case 'Low':
        return '';
      default:
        return '';
    }
  }
}
