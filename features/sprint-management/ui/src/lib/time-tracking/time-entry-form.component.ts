import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

type TimeEntry = SprintModels.TimeTracking.TimeEntry;
type CreateTimeEntryRequest = SprintModels.TimeTracking.CreateTimeEntryRequest;
type UpdateTimeEntryRequest = SprintModels.TimeTracking.UpdateTimeEntryRequest;

@Component({
  selector: 'lib-time-entry-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './time-entry-form.component.html',
  styleUrl: './time-entry-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeEntryFormComponent {
  workItemId = input.required<string>();
  entry = input<TimeEntry | null>(null);
  loading = input<boolean>(false);

  submitEntry = output<CreateTimeEntryRequest | UpdateTimeEntryRequest>();
  cancelEdit = output<void>();

  form = new FormGroup({
    date: new FormControl<Date>(new Date(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    hours: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01), Validators.max(24)]),
    description: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
  });

  constructor() {
    effect(() => {
      const existing = this.entry();
      if (existing) {
        this.form.patchValue({
          date: new Date(existing.date),
          hours: existing.hours,
          description: existing.description,
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid && !this.loading()) {
      const formValue = this.form.value;
      const dateStr = this.formatDate(formValue.date!);
      const existing = this.entry();

      if (existing) {
        const request: UpdateTimeEntryRequest = {
          id: existing.id,
          hours: formValue.hours ?? undefined,
          description: formValue.description ?? undefined,
          date: dateStr,
        };
        this.submitEntry.emit(request);
      } else {
        const request: CreateTimeEntryRequest = {
          work_item_id: this.workItemId(),
          hours: formValue.hours!,
          description: formValue.description ?? '',
          date: dateStr,
        };
        this.submitEntry.emit(request);
        this.form.reset({ date: new Date(), hours: null, description: '' });
      }
    } else {
      Object.keys(this.form.controls).forEach((key) => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.cancelEdit.emit();
    this.form.reset({ date: new Date(), hours: null, description: '' });
  }

  isEditMode(): boolean {
    return this.entry() !== null;
  }

  getSubmitButtonText(): string {
    return this.isEditMode() ? 'Update Entry' : 'Log Time';
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('min')) {
      return 'Hours must be greater than 0';
    }
    if (control?.hasError('max')) {
      return fieldName === 'hours' ? 'Maximum 24 hours' : '';
    }
    if (control?.hasError('maxlength')) {
      return 'Maximum 500 characters';
    }
    return '';
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
