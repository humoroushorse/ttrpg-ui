import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

type WorkItem = SprintModels.WorkItem.WorkItem;

/**
 * Work Item Table Actions Component
 *
 * Provides view, edit, and delete actions for work items in AG Grid table.
 * Used in the actions column of the work items table.
 *
 */
@Component({
  selector: 'lib-work-item-table-actions',
  standalone: true,
  imports: [RouterModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
  templateUrl: './work-item-table-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './work-item-table-actions.component.scss',
})
export class WorkItemTableActionsComponent {
  workItem = input.required<WorkItem>();

  viewClicked = output<WorkItem>();
  editClicked = output<WorkItem>();
  deleteClicked = output<WorkItem>();

  onView(): void {
    this.viewClicked.emit(this.workItem());
  }

  onEdit(): void {
    this.editClicked.emit(this.workItem());
  }

  onDelete(): void {
    this.deleteClicked.emit(this.workItem());
  }
}
