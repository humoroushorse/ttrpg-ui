import { ChangeDetectionStrategy, Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { getErrorMessage } from '@ttrpg-ui/features/sprint-management/util';
import { SharedFormsSingleSelectAutocompleteComponent } from '@ttrpg-ui/shared/forms/ui';

import {
  WorkItemStore,
  ProjectStore,
  SprintManagementApiService,
} from '@ttrpg-ui/features/sprint-management/data-access';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { WorkItemType, WorkItemStatus, WorkItemPriority } = SprintModels.WorkItem;
type UpdateWorkItemRequest = SprintModels.Api.UpdateWorkItemRequest;
type WorkItem = SprintModels.WorkItem.WorkItem;
type WorkItemType = SprintModels.WorkItem.WorkItemType;
type WorkItemStatus = SprintModels.WorkItem.WorkItemStatus;
type WorkItemPriority = SprintModels.WorkItem.WorkItemPriority;
type Sprint = SprintModels.Sprint.Sprint;
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'lib-page-work-item-edit',
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
  templateUrl: './page-work-item-edit.component.html',
  styleUrls: ['./page-work-item-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageWorkItemEditComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly sharedCoreService = inject(SharedCoreService);
  private readonly sharedLocalStorageService = inject(SharedLocalStorageService);
  private readonly snackBar = inject(MatSnackBar);
  public readonly workItemStore = inject(WorkItemStore);
  public readonly projectStore = inject(ProjectStore);
  private readonly sprintApiService = inject(SprintManagementApiService);

  private workItemId: string | null = null;

  private get FORM_CACHE_KEY(): string {
    return `PageWorkItemEditComponent.formData.${this.workItemId}`;
  }

  public isLoading = signal<boolean>(true);
  public isSubmitting = signal<boolean>(false);

  public workItem = signal<WorkItem | null>(null);

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
      assignee_id: ['', []],
      sprint_id: ['', []],
      parent_id: ['', []],
      project_id: ['', []],
      story_points: [null, [Validators.min(0)]],
      estimated_hours: [null, [Validators.min(0)]],
    });

    effect(() => {
      if (this.workItemForm.dirty && this.workItemId) {
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
    this.workItemId = this.route.snapshot.paramMap.get('id');

    if (!this.workItemId) {
      this.snackBar.open('Invalid work item ID', 'Close', { duration: 5000 });
      this.router.navigate(['/work-items']);
      return;
    }

    this.title.setTitle(`Sprint Management | Edit Work Item | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({
      name: 'description',
      content: 'Edit an existing work item in the sprint management system.',
    });

    this.loadWorkItem();

    this.projectStore.loadProjects({ page: 1, pageSize: 100 });
  }

  ngOnDestroy(): void {
    if (this.workItemForm.dirty && this.workItemId) {
      this.cacheFormData();
    }
  }

  private loadWorkItem(): void {
    if (!this.workItemId) return;

    this.isLoading.set(true);

    this.workItemStore.loadWorkItem(this.workItemId);

    // Wait for store to update
    setTimeout(() => {
      const selectedId = this.workItemStore.selectedEntityId();
      const selectedWorkItem = selectedId ? this.workItemStore.entityMap()[selectedId] : null;

      if (selectedWorkItem) {
        this.workItem.set(selectedWorkItem);
        this.populateForm(selectedWorkItem);
        this.isLoading.set(false);
      } else {
        const error = this.workItemStore.error();
        if (error) {
          this.snackBar.open(getErrorMessage(error, 'Failed to load work item'), 'Close', { duration: 5000 });
          this.router.navigate(['/work-items']);
        }
      }
    }, 500);
  }

  private populateForm(workItem: WorkItem): void {
    const cachedData = this.sharedLocalStorageService.get<any>(this.FORM_CACHE_KEY);

    if (cachedData) {
      this.workItemForm.patchValue(cachedData);
      if (cachedData.tags && Array.isArray(cachedData.tags)) {
        this.tags.set(cachedData.tags);
      }
      this.workItemForm.markAsPristine();

      this.snackBar.open('Draft changes restored. You can continue editing or discard the draft.', 'Dismiss', {
        duration: 5000,
      });
    } else {
      this.workItemForm.patchValue({
        title: workItem.title,
        description: workItem.description,
        type: workItem.type,
        status: workItem.status,
        priority: workItem.priority,
        assignee_id: workItem.assignee_id || '',
        sprint_id: workItem.sprint_id || '',
        parent_id: workItem.parent_id || '',
        project_id: workItem.project_id || '',
        story_points: workItem.story_points,
        estimated_hours: workItem.estimated_hours,
      });

      this.tags.set(workItem.tags || []);
      this.workItemForm.markAsPristine();
    }
  }

  private cacheFormData(): void {
    const formData = {
      ...this.workItemForm.value,
      tags: this.tags(),
    };
    this.sharedLocalStorageService.set(this.FORM_CACHE_KEY, formData);
  }

  public clearCachedFormData(): void {
    this.sharedLocalStorageService.remove(this.FORM_CACHE_KEY);

    const currentWorkItem = this.workItem();
    if (currentWorkItem) {
      this.populateForm(currentWorkItem);
    }

    this.snackBar.open('Draft discarded, form reset to original values', 'Dismiss', {
      duration: 2000,
    });
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

    if (!this.workItemId) {
      this.snackBar.open('Invalid work item ID', 'Close', { duration: 5000 });
      return;
    }

    this.isSubmitting.set(true);

    try {
      const request: UpdateWorkItemRequest = {
        id: this.workItemId,
        ...this.workItemForm.value,
        tags: this.tags(),
      };

      // Remove empty optional fields
      if (!request.assignee_id) delete request.assignee_id;
      if (!request.sprint_id) delete request.sprint_id;
      if (!request.parent_id) delete request.parent_id;
      if (!request.project_id) delete request.project_id;
      if (!request.story_points) delete request.story_points;
      if (!request.estimated_hours) delete request.estimated_hours;

      this.workItemStore.update(request);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const error = this.workItemStore.error();
      if (error) {
        throw new Error(getErrorMessage(error, 'Failed to update work item'));
      }

      this.sharedLocalStorageService.remove(this.FORM_CACHE_KEY);

      this.snackBar.open('Work item updated successfully', 'Close', {
        duration: 3000,
      });

      this.router.navigate(['/work-items', this.workItemId]);
    } catch (error) {
      console.error('Failed to update work item:', error);
      this.snackBar.open(error instanceof Error ? error.message : 'Failed to update work item', 'Close', {
        duration: 5000,
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  public onCancel(): void {
    if (this.workItemForm.dirty && this.workItemId) {
      this.cacheFormData();
    }

    if (this.workItemId) {
      this.router.navigate(['/work-items', this.workItemId]);
    } else {
      this.router.navigate(['/work-items']);
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
