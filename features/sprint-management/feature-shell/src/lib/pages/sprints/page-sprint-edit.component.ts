import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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

function dateRangeValidator(group: FormGroup): { [key: string]: any } | null {
  const startDate = group.get('start_date')?.value;
  const endDate = group.get('end_date')?.value;

  if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
    return { dateRange: true };
  }

  return null;
}

@Component({
  selector: 'lib-page-sprint-edit',
  standalone: true,
  imports: [
    CommonModule,
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
    MatSnackBarModule,
  ],
  templateUrl: './page-sprint-edit.component.html',
  styleUrls: ['./page-sprint-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageSprintEditComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly sharedCoreService = inject(SharedCoreService);
  private readonly sharedLocalStorageService = inject(SharedLocalStorageService);
  private readonly snackBar = inject(MatSnackBar);
  public readonly sprintStore = inject(SprintStore);

  private sprintId: string | null = null;

  private get FORM_CACHE_KEY(): string {
    return `PageSprintEditComponent.formData.${this.sprintId}`;
  }

  public isLoading = signal<boolean>(true);
  public isSubmitting = signal<boolean>(false);

  public sprint = signal<SprintModels.Sprint.Sprint | null>(null);

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
      { validators: dateRangeValidator }
    );

    effect(() => {
      if (this.sprintForm.dirty && this.sprintId) {
        this.cacheFormData();
      }
    });
  }

  ngOnInit(): void {
    this.sprintId = this.route.snapshot.paramMap.get('id');

    if (!this.sprintId) {
      this.snackBar.open('Invalid sprint ID', 'Close', { duration: 5000 });
      this.router.navigate(['/sprints']);
      return;
    }

    this.title.setTitle(
      `Sprint Management | Edit Sprint | ${this.sharedCoreService.appTitle}`
    );
    this.meta.updateTag({
      name: 'description',
      content: 'Edit an existing sprint in the sprint management system.',
    });

    this.loadSprint();
  }

  ngOnDestroy(): void {
    // Cache form data on component destroy if form is dirty
    if (this.sprintForm.dirty && this.sprintId) {
      this.cacheFormData();
    }
  }

  private loadSprint(): void {
    if (!this.sprintId) return;

    this.isLoading.set(true);

    this.sprintStore.loadSprint(this.sprintId);

    // Wait for store to update
    setTimeout(() => {
      const selectedId = this.sprintStore.selectedEntityId();
      const selectedSprint = selectedId ? this.sprintStore.entityMap()[selectedId] : null;

      if (selectedSprint) {
        this.sprint.set(selectedSprint);
        this.populateForm(selectedSprint);
        this.isLoading.set(false);
      } else {
        const error = this.sprintStore.error();
        if (error) {
          this.snackBar.open(
            getErrorMessage(error, 'Failed to load sprint'),
            'Close',
            { duration: 5000 }
          );
          this.router.navigate(['/sprints']);
        }
      }
    }, 500);
  }

  private populateForm(sprint: SprintModels.Sprint.Sprint): void {
    const cachedData = this.sharedLocalStorageService.get<any>(
      this.FORM_CACHE_KEY
    );

    if (cachedData) {
      this.sprintForm.patchValue({
        ...cachedData,
        start_date: cachedData.start_date
          ? new Date(cachedData.start_date)
          : null,
        end_date: cachedData.end_date ? new Date(cachedData.end_date) : null,
      });
      this.sprintForm.markAsPristine();

      this.snackBar.open(
        'Draft changes restored. You can continue editing or discard the draft.',
        'Dismiss',
        { duration: 5000 }
      );
    } else {
      this.sprintForm.patchValue({
        name: sprint.name,
        description: sprint.description,
        start_date: new Date(sprint.start_date),
        end_date: new Date(sprint.end_date),
        goal: sprint.goal || '',
      });
      this.sprintForm.markAsPristine();
    }
  }

  private cacheFormData(): void {
    const formData = {
      ...this.sprintForm.value,
      start_date: this.sprintForm.value.start_date
        ? new Date(this.sprintForm.value.start_date).toISOString()
        : null,
      end_date: this.sprintForm.value.end_date
        ? new Date(this.sprintForm.value.end_date).toISOString()
        : null,
    };
    this.sharedLocalStorageService.set(this.FORM_CACHE_KEY, formData);
  }

  public clearCachedFormData(): void {
    this.sharedLocalStorageService.remove(this.FORM_CACHE_KEY);

    const currentSprint = this.sprint();
    if (currentSprint) {
      this.populateForm(currentSprint);
    }

    this.snackBar.open(
      'Draft discarded, form reset to original values',
      'Dismiss',
      { duration: 2000 }
    );
  }

  public async onSubmit(): Promise<void> {
    if (this.sprintForm.invalid) {
      this.sprintForm.markAllAsTouched();
      this.snackBar.open(
        'Please fill in all required fields correctly',
        'Close',
        { duration: 5000 }
      );
      return;
    }

    if (!this.sprintId) {
      this.snackBar.open('Invalid sprint ID', 'Close', { duration: 5000 });
      return;
    }

    this.isSubmitting.set(true);

    try {
      const formValue = this.sprintForm.value;
      const request: SprintModels.Api.UpdateSprintRequest = {
        id: this.sprintId,
        name: formValue.name,
        description: formValue.description,
        start_date: new Date(formValue.start_date).toISOString().split('T')[0],
        end_date: new Date(formValue.end_date).toISOString().split('T')[0],
        goal: formValue.goal || undefined,
      };

      this.sprintStore.update(request);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const error = this.sprintStore.error();
      if (error) {
        throw new Error(getErrorMessage(error, 'Failed to update sprint'));
      }

      this.sharedLocalStorageService.remove(this.FORM_CACHE_KEY);

      // Show success message
      this.snackBar.open('Sprint updated successfully', 'Close', {
        duration: 3000,
      });

      // Navigate back to sprint detail
      this.router.navigate(['/sprints', this.sprintId]);
    } catch (error) {
      console.error('Failed to update sprint:', error);
      this.snackBar.open(
        error instanceof Error ? error.message : 'Failed to update sprint',
        'Close',
        { duration: 5000 }
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  public onCancel(): void {
    if (this.sprintForm.dirty && this.sprintId) {
      this.cacheFormData();
    }

    if (this.sprintId) {
      this.router.navigate(['/sprints', this.sprintId]);
    } else {
      this.router.navigate(['/sprints']);
    }
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
