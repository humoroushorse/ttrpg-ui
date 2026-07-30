import { ChangeDetectionStrategy, Component, input, output, effect, signal } from '@angular/core';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { SprintStatus } = SprintModels.Sprint;
type Sprint = SprintModels.Sprint.Sprint;
type SprintStatus = SprintModels.Sprint.SprintStatus;
type CreateSprintRequest = SprintModels.Api.CreateSprintRequest;
type UpdateSprintRequest = SprintModels.Api.UpdateSprintRequest;
import { sprintDateValidator } from '@ttrpg-ui/features/sprint-management/util';

/**
 * Sprint Form Component
 *
 * Reusable form for creating and editing sprints with date range picker
 * and validation.
 *
 */
@Component({
  selector: 'lib-sprint-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatIconModule
],
  templateUrl: './sprint-form.component.html',
  styleUrl: './sprint-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SprintFormComponent {
  sprint = input<Sprint | null>(null);
  isEditMode = input<boolean>(false);
  formSubmitted = output<CreateSprintRequest | UpdateSprintRequest>();
  cancelled = output<void>();

  sprintStatuses = Object.values(SprintStatus);
  isSubmitting = signal<boolean>(false);

  form = new FormGroup(
    {
      name: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(200)],
      }),
      description: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.maxLength(2000)],
      }),
      start_date: new FormControl<Date | null>(null, {
        validators: [Validators.required],
      }),
      end_date: new FormControl<Date | null>(null, {
        validators: [Validators.required],
      }),
      goal: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.maxLength(500)],
      }),
      status: new FormControl<SprintStatus>(SprintStatus.Planning, {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    {
      validators: [sprintDateValidator()],
    },
  );

  constructor() {
    // Populate form when sprint input changes
    effect(() => {
      const sprint = this.sprint();
      if (sprint) {
        this.form.patchValue({
          name: sprint.name,
          description: sprint.description,
          start_date: new Date(sprint.start_date),
          end_date: new Date(sprint.end_date),
          goal: sprint.goal || '',
          status: sprint.status,
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const formValue = this.form.getRawValue();
    const sprint = this.sprint();

    if (this.isEditMode() && sprint) {
      // Edit mode - emit UpdateSprintRequest
      const request: UpdateSprintRequest = {
        id: sprint.id,
        name: formValue.name,
        description: formValue.description,
        start_date: formValue.start_date ? formValue.start_date.toISOString() : '',
        end_date: formValue.end_date ? formValue.end_date.toISOString() : '',
        goal: formValue.goal || undefined,
        status: formValue.status,
      };
      this.formSubmitted.emit(request);
    } else {
      // Create mode - emit CreateSprintRequest
      const request: CreateSprintRequest = {
        name: formValue.name,
        description: formValue.description,
        start_date: formValue.start_date ? formValue.start_date.toISOString() : '',
        end_date: formValue.end_date ? formValue.end_date.toISOString() : '',
        goal: formValue.goal || undefined,
      };
      this.formSubmitted.emit(request);
    }

    // Reset submitting state after a delay (parent component should handle this)
    setTimeout(() => this.isSubmitting.set(false), 1000);
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return `${this.getFieldLabel(controlName)} is required`;
    }

    if (control.errors['maxlength']) {
      const maxLength = control.errors['maxlength'].requiredLength;
      return `${this.getFieldLabel(controlName)} must be at most ${maxLength} characters`;
    }

    return 'Invalid value';
  }

  getFormErrorMessage(): string {
    if (this.form.errors?.['invalidDateRange']) {
      return 'End date must be after start date';
    }
    return '';
  }

  private getFieldLabel(controlName: string): string {
    const labels: Record<string, string> = {
      name: 'Sprint name',
      description: 'Description',
      start_date: 'Start date',
      end_date: 'End date',
      goal: 'Goal',
      status: 'Status',
    };
    return labels[controlName] || controlName;
  }

  hasError(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  hasDateRangeError(): boolean {
    return !!(
      this.form.errors?.['invalidDateRange'] &&
      this.form.get('start_date')?.touched &&
      this.form.get('end_date')?.touched
    );
  }
}
