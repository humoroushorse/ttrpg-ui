import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';
import { WorkItemLinkFormComponent } from './work-item-link-form.component';

type CreateWorkItemLinkRequest = SprintModels.WorkItemLink.CreateWorkItemLinkRequest;

export interface WorkItemLinkDialogData {
  sourceWorkItemId: string;
}

@Component({
  selector: 'lib-work-item-link-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, WorkItemLinkFormComponent],
  templateUrl: './work-item-link-dialog.component.html',
  styleUrl: './work-item-link-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkItemLinkDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<WorkItemLinkDialogComponent>);
  private readonly dialogData: WorkItemLinkDialogData = inject(MAT_DIALOG_DATA, { optional: true }) ?? {
    sourceWorkItemId: '',
  };

  sourceWorkItemId = input<string>(this.dialogData.sourceWorkItemId);
  loading = input<boolean>(false);

  linkCreated = output<CreateWorkItemLinkRequest>();

  onFormSubmit(request: CreateWorkItemLinkRequest): void {
    this.linkCreated.emit(request);
    this.dialogRef.close(request);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
