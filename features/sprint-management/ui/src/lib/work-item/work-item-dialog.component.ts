import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

type WorkItem = SprintModels.WorkItem.WorkItem;
type CreateWorkItemRequest = SprintModels.Api.CreateWorkItemRequest;
type UpdateWorkItemRequest = SprintModels.Api.UpdateWorkItemRequest;
import { WorkItemFormComponent } from './work-item-form.component';

export interface WorkItemDialogData {
  workItem?: WorkItem | null;
  initialData?: Partial<CreateWorkItemRequest> | null;
  title?: string;
  loading?: boolean;
}

@Component({
  selector: 'lib-work-item-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, WorkItemFormComponent],
  templateUrl: './work-item-dialog.component.html',
  styleUrl: './work-item-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkItemDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<WorkItemDialogComponent>);
  protected readonly dialogData: WorkItemDialogData = inject(MAT_DIALOG_DATA, { optional: true }) ?? {};

  workItem = input<WorkItem | null>(this.dialogData.workItem ?? null);
  loading = input<boolean>(this.dialogData.loading ?? false);
  title = input<string>(this.dialogData.title ?? 'Work Item');

  formSubmitted = output<CreateWorkItemRequest | UpdateWorkItemRequest>();

  onFormSubmit(request: CreateWorkItemRequest | UpdateWorkItemRequest): void {
    this.formSubmitted.emit(request);
    this.dialogRef.close(request);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
