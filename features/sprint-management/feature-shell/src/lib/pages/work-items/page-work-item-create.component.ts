import { ChangeDetectionStrategy, Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';

import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { getErrorMessage } from '@ttrpg-ui/features/sprint-management/util';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { SharedFormsSingleSelectAutocompleteComponent } from '@ttrpg-ui/shared/forms/ui';

import {
  WorkItemStore,
  ProjectStore,
  SprintManagementApiService,
} from '@ttrpg-ui/features/sprint-management/data-access';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { WorkItemType, WorkItemStatus, WorkItemPriority } = SprintModels.WorkItem;
type CreateWorkItemRequest = SprintModels.Api.CreateWorkItemRequest;
type WorkItemType = SprintModels.WorkItem.WorkItemType;
type WorkItemStatus = SprintModels.WorkItem.WorkItemStatus;
type WorkItemPriority = SprintModels.WorkItem.WorkItemPriority;
type Sprint = SprintModels.Sprint.Sprint;
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'lib-page-work-item-create',
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
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatFormFieldModule,
    SharedFormsSingleSelectAutocompleteComponent,
  ],
  templateUrl: './page-work-item-create.component.html',
  styleUrls: ['./page-work-item-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageWorkItemCreateComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly sharedCoreService = inject(SharedCoreService);
  private readonly sharedLocalStorageService = inject(SharedLocalStorageService);
  private readonly snackBar = inject(MatSnackBar);
  public readonly workItemStore = inject(WorkItemStore);
  public readonly projectStore = inject(ProjectStore);
  private readonly sprintApiService = inject(SprintManagementApiService);

  private readonly FORM_CACHE_KEY = 'PageWorkItemCreateComponent.formData';

  public isSubmitting = signal<boolean>(false);

  // Enum values for dropdowns
  public readonly workItemTypes = Object.values(WorkItemType);
  public readonly workItemStatuses = Object.values(WorkItemStatus);
  public readonly workItemPriorities = Object.values(WorkItemPriority);

  public tags = signal<string[]>([]);
  public tagInput = signal<string>('');

  public workItemForm: FormGroup;

  private typeSignal = signal<WorkItemType>(WorkItemType.Story);

  public isParentRequired = computed(() => {
    const type = this.typeSignal();
    return type === WorkItemType.Story || type === WorkItemType.Defect;
  });

  constructor() {
    this.workItemForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1)]],
      description: ['', []],
      type: [WorkItemType.Story, [Validators.required]],
      status: [WorkItemStatus.Backlog, [Validators.required]],
      priority: [WorkItemPriority.Medium, [Validators.required]],
      project_id: ['', [Validators.required]],
      assignee_id: ['', []],
      sprint_id: ['', []],
      parent_id: ['', []],
      story_points: [null, [Validators.min(0)]],
      estimated_hours: [null, [Validators.min(0)]],
    });

    effect(() => {
      if (this.workItemForm.dirty) {
        this.cacheFormData();
      }
    });

    this.workItemForm.get('type')?.valueChanges.subscribe((type) => {
      this.typeSignal.set(type);
      const parentControl = this.workItemForm.get('parent_id');
      if (type === WorkItemType.Epic) {
        parentControl?.clearValidators();
        parentControl?.setValue('');
      } else {
        parentControl?.setValidators([Validators.required]);
      }
      parentControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.title.setTitle(`Sprint Management | Create Work Item | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({
      name: 'description',
      content: 'Create a new work item in the sprint management system.',
    });

    this.restoreCachedFormData();

    this.projectStore.loadProjects({ page: 1, pageSize: 100 });
  }

  ngOnDestroy(): void {
    if (this.workItemForm.dirty) {
      this.cacheFormData();
    }
  }

  private cacheFormData(): void {
    const formData = {
      ...this.workItemForm.value,
      tags: this.tags(),
    };
    this.sharedLocalStorageService.set(this.FORM_CACHE_KEY, formData);
  }

  private restoreCachedFormData(): void {
    const cachedData = this.sharedLocalStorageService.get<any>(this.FORM_CACHE_KEY);

    if (cachedData) {
      // Restore form values
      this.workItemForm.patchValue(cachedData);

      // Restore tags
      if (cachedData.tags && Array.isArray(cachedData.tags)) {
        this.tags.set(cachedData.tags);
      }

      this.workItemForm.markAsPristine();

      this.snackBar.open('Draft data restored. You can continue editing or clear the draft.', 'Dismiss', {
        duration: 5000,
      });
    }
  }

  public clearCachedFormData(): void {
    this.sharedLocalStorageService.remove(this.FORM_CACHE_KEY);
    this.workItemForm.reset({
      type: WorkItemType.Story,
      status: WorkItemStatus.Backlog,
      priority: WorkItemPriority.Medium,
    });
    this.tags.set([]);
    this.snackBar.open('Draft cleared', 'Dismiss', { duration: 2000 });
  }

  public addTag(): void {
    const tag = this.tagInput().trim();
    if (tag && !this.tags().includes(tag)) {
      this.tags.update((tags) => [...tags, tag]);
      this.tagInput.set('');
      this.workItemForm.markAsDirty();
    }
  }

  public removeTag(tag: string): void {
    this.tags.update((tags) => tags.filter((t) => t !== tag));
    this.workItemForm.markAsDirty();
  }

  public async onSubmit(): Promise<void> {
    if (this.workItemForm.invalid) {
      this.workItemForm.markAllAsTouched();
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 5000 });
      return;
    }

    this.isSubmitting.set(true);

    try {
      const request: CreateWorkItemRequest = {
        ...this.workItemForm.value,
        tags: this.tags(),
        custom_fields: {},
      };

      // Remove empty optional fields
      if (!request.assignee_id) delete request.assignee_id;
      if (!request.sprint_id) delete request.sprint_id;
      if (!request.parent_id) delete request.parent_id;
      if (!request.story_points) delete request.story_points;
      if (!request.estimated_hours) delete request.estimated_hours;

      this.workItemStore.create(request);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const error = this.workItemStore.error();
      if (error) {
        throw new Error(getErrorMessage(error, 'Failed to create work item'));
      }

      this.sharedLocalStorageService.remove(this.FORM_CACHE_KEY);

      this.snackBar.open('Work item created successfully', 'Close', {
        duration: 3000,
      });

      this.router.navigate(['/work-items']);
    } catch (error) {
      console.error('Failed to create work item:', error);
      this.snackBar.open(error instanceof Error ? error.message : 'Failed to create work item', 'Close', {
        duration: 5000,
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  public searchSprints = (query: string): Observable<Sprint[]> => {
    return this.sprintApiService.searchSprints(query).pipe(map((response) => response.items));
  };

  public getSprintDisplayName = (sprint: Sprint | null): string => {
    return sprint?.name || '';
  };

  public getSprintId = (sprint: Sprint | null): string => {
    return sprint?.id || '';
  };

  public onCancel(): void {
    if (this.workItemForm.dirty) {
      this.cacheFormData();
    }
    this.router.navigate(['/work-items']);
  }

  public getErrorMessage(controlName: string): string {
    const control = this.workItemForm.get(controlName);
    if (!control) return '';

    if (control.hasError('required')) {
      return 'This field is required';
    }
    if (control.hasError('minlength')) {
      return 'This field is too short';
    }
    if (control.hasError('min')) {
      return 'Value must be greater than or equal to 0';
    }

    return '';
  }
}
