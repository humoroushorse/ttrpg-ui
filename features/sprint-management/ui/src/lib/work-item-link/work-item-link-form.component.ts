import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

type CreateWorkItemLinkRequest = SprintModels.WorkItemLink.CreateWorkItemLinkRequest;
const { LinkType } = SprintModels.WorkItemLink;

@Component({
  selector: 'lib-work-item-link-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './work-item-link-form.component.html',
  styleUrl: './work-item-link-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkItemLinkFormComponent {
  sourceWorkItemId = input.required<string>();
  loading = input<boolean>(false);

  formSubmitted = output<CreateWorkItemLinkRequest>();
  cancelled = output<void>();

  readonly linkTypes = Object.values(LinkType);
  readonly LinkType = LinkType;

  readonly linkTypeLabels: Record<string, string> = {
    [LinkType.Blocks]: 'Blocks',
    [LinkType.BlockedBy]: 'Blocked By',
    [LinkType.RelatedTo]: 'Related To',
    [LinkType.DuplicateOf]: 'Duplicate Of',
  };

  form = new FormGroup({
    target_work_item_id: new FormControl('', [Validators.required, Validators.minLength(1)]),
    link_type: new FormControl<SprintModels.WorkItemLink.LinkType>(LinkType.RelatedTo, [Validators.required]),
  });

  onSubmit(): void {
    if (this.form.valid) {
      const value = this.form.value;
      this.formSubmitted.emit({
        source_work_item_id: this.sourceWorkItemId(),
        target_work_item_id: value.target_work_item_id ?? '',
        link_type: value.link_type ?? LinkType.RelatedTo,
      });
    } else {
      Object.values(this.form.controls).forEach((c) => c.markAsTouched());
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
