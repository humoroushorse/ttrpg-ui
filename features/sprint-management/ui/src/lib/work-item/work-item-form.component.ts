import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';
import { TagInputComponent } from '../advanced/tag-input.component';
import { CustomFieldListComponent } from '../advanced/custom-field-list.component';
import { TemplateSelectorComponent } from '../advanced/template-selector.component';
import { WorkItemStore, CustomFieldStore } from '@ttrpg-ui/features/sprint-management/data-access';

const { WorkItemType, WorkItemStatus, WorkItemPriority } = SprintModels.WorkItem;
type WorkItem = SprintModels.WorkItem.WorkItem;
type WorkItemType = SprintModels.WorkItem.WorkItemType;
type WorkItemStatus = SprintModels.WorkItem.WorkItemStatus;
type WorkItemPriority = SprintModels.WorkItem.WorkItemPriority;
type CreateWorkItemRequest = SprintModels.Api.CreateWorkItemRequest;
type UpdateWorkItemRequest = SprintModels.Api.UpdateWorkItemRequest;
type WorkItemTemplate = SprintModels.Template.WorkItemTemplate;

@Component({
  selector: 'lib-work-item-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule,
    TagInputComponent,
    CustomFieldListComponent,
    TemplateSelectorComponent,
  ],
  templateUrl: './work-item-form.component.html',
  styleUrl: './work-item-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkItemFormComponent implements OnInit {
  workItem = input<WorkItem | null>(null);
  initialData = input<Partial<CreateWorkItemRequest> | null>(null);
  loading = input<boolean>(false);

  formSubmitted = output<CreateWorkItemRequest | UpdateWorkItemRequest>();
  cancelled = output<void>();

  readonly workItemTypes = Object.values(WorkItemType);
  readonly workItemStatuses = Object.values(WorkItemStatus);
  readonly workItemPriorities = Object.values(WorkItemPriority);

  private readonly store = inject(WorkItemStore);
  readonly availableTags = this.store.getAvailableTags;

  private readonly customFieldStore = inject(CustomFieldStore);
  readonly customFieldDefinitions = this.customFieldStore.fields;

  tagInput = new FormControl('');
  tags = signal<string[]>([]);
  customFields = signal<SprintModels.CustomField.CustomFieldValue[]>([]);

  ngOnInit(): void {
    this.customFieldStore.loadCustomFields();
  }

  private typeSignal = signal<WorkItemType>(WorkItemType.Story);

  isParentRequired = computed(() => {
    const type = this.typeSignal();
    return type === WorkItemType.Story || type === WorkItemType.Defect;
  });

  form = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(1)]),
    description: new FormControl('', [Validators.required]),
    type: new FormControl<WorkItemType>(WorkItemType.Story, [Validators.required]),
    status: new FormControl<WorkItemStatus>(WorkItemStatus.Todo, [Validators.required]),
    priority: new FormControl<WorkItemPriority>(WorkItemPriority.Medium, [Validators.required]),
    project_id: new FormControl<string | null>(null, [Validators.required]),
    assignee_id: new FormControl<string | null>(null),
    sprint_id: new FormControl<string | null>(null),
    parent_id: new FormControl<string | null>(null),
    story_points: new FormControl<number | null>(null, [Validators.min(0)]),
    estimated_hours: new FormControl<number | null>(null, [Validators.min(0)]),
  });

  constructor() {
    // Load work item data when provided
    effect(() => {
      const item = this.workItem();
      if (item) {
        this.form.patchValue({
          title: item.title,
          description: item.description,
          type: item.type,
          status: item.status,
          priority: item.priority,
          assignee_id: item.assignee_id,
          sprint_id: item.sprint_id,
          parent_id: item.parent_id,
          story_points: item.story_points,
          estimated_hours: item.estimated_hours,
        });
        this.tags.set([...item.tags]);
        this.typeSignal.set(item.type);
      }
    });

    // Pre-fill from cloned/initial data when no existing work item
    effect(() => {
      const data = this.initialData();
      const item = this.workItem();
      if (data && !item) {
        this.form.patchValue({
          title: data.title ?? '',
          description: data.description ?? '',
          type: data.type ?? WorkItemType.Story,
          status: data.status ?? WorkItemStatus.Todo,
          priority: data.priority ?? WorkItemPriority.Medium,
          assignee_id: data.assignee_id ?? null,
          sprint_id: data.sprint_id ?? null,
          parent_id: data.parent_id ?? null,
          story_points: data.story_points ?? null,
          estimated_hours: data.estimated_hours ?? null,
        });
        if (data.tags) this.tags.set([...data.tags]);
        if (data.type) this.typeSignal.set(data.type);
      }
    });

    // Update parent_id validation when type changes
    this.form.get('type')?.valueChanges.subscribe(type => {
      if (type) {
        this.typeSignal.set(type);
      }
      const parentControl = this.form.get('parent_id');
      if (type === WorkItemType.Epic) {
        // Epic cannot have parent
        parentControl?.clearValidators();
        parentControl?.setValue(null);
        parentControl?.disable();
      } else {
        // Story and Defect must have parent
        parentControl?.setValidators([Validators.required]);
        parentControl?.enable();
      }
      parentControl?.updateValueAndValidity();
    });
  }

  onTemplateSelected(template: WorkItemTemplate | null): void {
    if (!template) return;
    if (template.defaultPriority) {
      this.form.patchValue({ priority: template.defaultPriority });
    }
    if (template.descriptionTemplate) {
      this.form.patchValue({ description: template.descriptionTemplate });
    }
    if (template.defaultTags?.length) {
      const current = this.tags();
      const merged = [...current];
      for (const tag of template.defaultTags) {
        if (!merged.includes(tag)) {
          merged.push(tag);
        }
      }
      this.tags.set(merged);
    }
  }

  addTag(tag?: string): void {
    const value = tag ?? this.tagInput.value?.trim();
    if (value && !this.tags().includes(value)) {
      this.tags.update(tags => [...tags, value]);
      this.tagInput.setValue('');
    }
  }

  removeTag(tag: string): void {
    this.tags.update(tags => tags.filter(t => t !== tag));
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      const item = this.workItem();
      const customFieldsRecord = this.customFields().reduce<Record<string, any>>((acc, cf) => {
        acc[cf.key] = cf.value;
        return acc;
      }, {});

      if (item) {
        // Update request
        const request: UpdateWorkItemRequest = {
          id: item.id,
          title: formValue.title ?? '',
          description: formValue.description ?? '',
          type: formValue.type ?? WorkItemType.Story,
          status: formValue.status ?? WorkItemStatus.Todo,
          priority: formValue.priority ?? WorkItemPriority.Medium,
          project_id: formValue.project_id || undefined,
          assignee_id: formValue.assignee_id || undefined,
          sprint_id: formValue.sprint_id || undefined,
          parent_id: formValue.parent_id || undefined,
          story_points: formValue.story_points || undefined,
          estimated_hours: formValue.estimated_hours || undefined,
          tags: this.tags(),
          custom_fields: customFieldsRecord,
        };
        this.formSubmitted.emit(request);
      } else {
        // Create request
        const request: CreateWorkItemRequest = {
          title: formValue.title ?? '',
          description: formValue.description ?? '',
          type: formValue.type ?? WorkItemType.Story,
          status: formValue.status ?? WorkItemStatus.Todo,
          priority: formValue.priority ?? WorkItemPriority.Medium,
          project_id: formValue.project_id ?? '', // Required
          assignee_id: formValue.assignee_id || undefined,
          sprint_id: formValue.sprint_id || undefined,
          parent_id: formValue.parent_id || undefined,
          story_points: formValue.story_points || undefined,
          estimated_hours: formValue.estimated_hours || undefined,
          tags: this.tags(),
          custom_fields: customFieldsRecord,
        };
        this.formSubmitted.emit(request);
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('minlength')) {
      return 'Value is too short';
    }
    if (control?.hasError('min')) {
      return 'Value must be positive';
    }
    return '';
  }
}
