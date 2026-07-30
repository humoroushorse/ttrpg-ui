import { ChangeDetectionStrategy, Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';

import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { getErrorMessage } from '@ttrpg-ui/features/sprint-management/util';

import { SprintStore } from '@ttrpg-ui/features/sprint-management/data-access';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

type CreateSprintRequest = SprintModels.Api.CreateSprintRequest;

function dateRangeValidator(group: FormGroup): { [key: string]: any } | null {
  const startDate = group.get('start_date')?.value;
  const endDate = group.get('end_date')?.value;

  if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
    return { dateRange: true };
  }

  return null;
}

@Component({
  selector: 'lib-page-sprint-create',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
],
  templateUrl: './page-sprint-create.component.html',
  styleUrls: ['./page-sprint-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageSprintCreateComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly sharedCoreService = inject(SharedCoreService);
  private readonly sharedLocalStorageService = inject(SharedLocalStorageService);
  private readonly snackBar = inject(MatSnackBar);
  public readonly sprintStore = inject(SprintStore);

  private readonly FORM_CACHE_KEY = 'PageSprintCreateComponent.formData';

  public isSubmitting = signal<boolean>(false);

  public sprintForm: FormGroup;

  constructor() {
    this.sprintForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(1)]],
        description: ['', []],
        start_date: ['', [Validators.required]],
        end_date: ['', [Validators.required]],
        goal: ['', []],
      },
      { validators: dateRangeValidator },
    );

    effect(() => {
      if (this.sprintForm.dirty) {
        this.cacheFormData();
      }
    });
  }

  ngOnInit(): void {
    this.title.setTitle(`Sprint Management | Create Sprint | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({
      name: 'description',
      content: 'Create a new sprint in the sprint management system.',
    });

    this.restoreCachedFormData();
  }

  ngOnDestroy(): void {
    if (this.sprintForm.dirty) {
      this.cacheFormData();
    }
  }

  private cacheFormData(): void {
    const formData = {
      ...this.sprintForm.value,
      start_date: this.sprintForm.value.start_date ? new Date(this.sprintForm.value.start_date).toISOString() : null,
      end_date: this.sprintForm.value.end_date ? new Date(this.sprintForm.value.end_date).toISOString() : null,
    };
    this.sharedLocalStorageService.set(this.FORM_CACHE_KEY, formData);
  }

  private restoreCachedFormData(): void {
    const cachedData = this.sharedLocalStorageService.get<any>(this.FORM_CACHE_KEY);

    if (cachedData) {
      // Restore form values, converting date strings back to Date objects
      this.sprintForm.patchValue({
        ...cachedData,
        start_date: cachedData.start_date ? new Date(cachedData.start_date) : null,
        end_date: cachedData.end_date ? new Date(cachedData.end_date) : null,
      });

      this.sprintForm.markAsPristine();

      this.snackBar.open('Draft data restored. You can continue editing or clear the draft.', 'Dismiss', {
        duration: 5000,
      });
    }
  }

  public clearCachedFormData(): void {
    this.sharedLocalStorageService.remove(this.FORM_CACHE_KEY);
    this.sprintForm.reset();
    this.snackBar.open('Draft cleared', 'Dismiss', { duration: 2000 });
  }

  public async onSubmit(): Promise<void> {
    if (this.sprintForm.invalid) {
      this.sprintForm.markAllAsTouched();
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 5000 });
      return;
    }

    this.isSubmitting.set(true);

    try {
      const formValue = this.sprintForm.value;
      const request: CreateSprintRequest = {
        name: formValue.name,
        description: formValue.description,
        start_date: new Date(formValue.start_date).toISOString().split('T')[0],
        end_date: new Date(formValue.end_date).toISOString().split('T')[0],
        goal: formValue.goal || undefined,
      };

      this.sprintStore.create(request);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const error = this.sprintStore.error();
      if (error) {
        throw new Error(getErrorMessage(error, 'Failed to create sprint'));
      }

      this.sharedLocalStorageService.remove(this.FORM_CACHE_KEY);

      this.snackBar.open('Sprint created successfully', 'Close', {
        duration: 3000,
      });

      this.router.navigate(['/sprints']);
    } catch (error) {
      console.error('Failed to create sprint:', error);
      this.snackBar.open(error instanceof Error ? error.message : 'Failed to create sprint', 'Close', {
        duration: 5000,
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  public onCancel(): void {
    if (this.sprintForm.dirty) {
      this.cacheFormData();
    }
    this.router.navigate(['/sprints']);
  }

  public getErrorMessage(controlName: string): string {
    const control = this.sprintForm.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'This field is required';
    }
    if (control.hasError('minlength')) {
      return 'This field is too short';
    }

    return '';
  }

  public getDateRangeError(): string {
    if (this.sprintForm.hasError('dateRange')) {
      return 'End date must be after start date';
    }
    return '';
  }
}
