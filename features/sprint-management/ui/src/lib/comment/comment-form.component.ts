import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  effect,
  inject,
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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { DomSanitizer } from '@angular/platform-browser';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

type Comment = SprintModels.Comment.Comment;
import { sanitizeMarkdown } from '@ttrpg-ui/features/sprint-management/util';

@Component({
  selector: 'lib-comment-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatTabsModule,
  ],
  templateUrl: './comment-form.component.html',
  styleUrl: './comment-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentFormComponent {
  private readonly sanitizer = inject(DomSanitizer);

  comment = input<Comment | null>(null);
  loading = input<boolean>(false);
  placeholder = input<string>('Write a comment... (Markdown supported)');

  submitComment = output<string>();
  cancelEdit = output<void>();

  form = new FormGroup({
    content: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, this.notEmptyValidator],
    }),
  });

  selectedTabIndex = signal<number>(0);
  previewContent = signal<string>('');

  constructor() {
    // Load comment content if editing
    effect(() => {
      const comment = this.comment();
      if (comment) {
        this.form.patchValue({ content: comment.content });
      }
    });

    // Update preview content when form value changes
    effect(() => {
      const content = this.form.value.content || '';
      this.previewContent.set(content);
    });
  }

  private notEmptyValidator(
    control: FormControl<string>
  ): Record<string, unknown> | null {
    const value = control.value || '';
    if (value.trim().length === 0) {
      return { empty: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.form.valid && !this.loading()) {
      const content = this.form.value.content?.trim() || '';
      if (content) {
        this.submitComment.emit(content);
        // Reset form after submission (only if not editing)
        if (!this.comment()) {
          this.form.reset();
          this.selectedTabIndex.set(0);
        }
      }
    }
  }

  onCancel(): void {
    this.cancelEdit.emit();
    this.form.reset();
    this.selectedTabIndex.set(0);
  }

  isEditMode(): boolean {
    return this.comment() !== null;
  }

  getSubmitButtonText(): string {
    return this.isEditMode() ? 'Update Comment' : 'Add Comment';
  }

  getContentErrorMessage(): string {
    const control = this.form.controls.content;
    if (control.hasError('required')) {
      return 'Comment content is required';
    }
    if (control.hasError('empty')) {
      return 'Comment cannot be empty or contain only whitespace';
    }
    return '';
  }

  showPreview(): void {
    this.selectedTabIndex.set(1);
  }

  showWrite(): void {
    this.selectedTabIndex.set(0);
  }

  sanitizeContent(content: string): string {
    return sanitizeMarkdown(content, this.sanitizer);
  }
}
