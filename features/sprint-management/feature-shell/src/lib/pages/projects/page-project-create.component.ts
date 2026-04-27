import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { ProjectStore } from '@ttrpg-ui/features/sprint-management/data-access';

@Component({
  selector: 'lib-page-project-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
  ],
  templateUrl: './page-project-create.component.html',
  styleUrls: ['./page-project-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageProjectCreateComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly sharedCoreService = inject(SharedCoreService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly projectStore = inject(ProjectStore);

  projectForm: FormGroup = this.fb.group({
    key: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(10), Validators.pattern(/^[A-Z0-9]+$/)],
    ],
    name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
    description: [''],
    starting_number: [1, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.title.setTitle(`Sprint Management | Create Project | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({
      name: 'description',
      content: 'Create a new project for organizing work items.',
    });

    // Auto-uppercase the key field
    this.projectForm.get('key')?.valueChanges.subscribe((value) => {
      if (value) {
        this.projectForm.get('key')?.setValue(value.toUpperCase(), { emitEvent: false });
      }
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    const formValue = this.projectForm.value;

    this.projectStore.create({
      key: formValue.key,
      name: formValue.name,
      description: formValue.description || '',
      starting_number: formValue.starting_number || 1,
    });

    this.snackBar.open('Project created successfully', 'Close', {
      duration: 3000,
    });

    this.router.navigate(['/projects']);
  }

  onCancel(): void {
    this.router.navigate(['/projects']);
  }
}
