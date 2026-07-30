import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { ProjectStore } from '@ttrpg-ui/features/sprint-management/data-access';

@Component({
  selector: 'lib-page-project-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
],
  templateUrl: './page-project-edit.component.html',
  styleUrls: ['./page-project-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageProjectEditComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly sharedCoreService = inject(SharedCoreService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly projectStore = inject(ProjectStore);

  projectId = signal<string>('');
  loading = signal<boolean>(true);

  projectForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
    description: [''],
  });

  ngOnInit(): void {
    this.title.setTitle(`Sprint Management | Edit Project | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({
      name: 'description',
      content: 'Edit project details.',
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.projectId.set(id);
      this.loadProject(id);
    }
  }

  loadProject(id: string): void {
    this.projectStore.loadProject(id);

    // Wait for the project to load
    setTimeout(() => {
      const selectedId = this.projectStore.selectedEntityId();
      const project = selectedId ? this.projectStore.entityMap()[selectedId] : null;
      if (project) {
        this.projectForm.patchValue({
          name: project.name,
          description: project.description,
        });
        this.loading.set(false);
      }
    }, 500);
  }

  onSubmit(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    const formValue = this.projectForm.value;

    this.projectStore.update({
      id: this.projectId(),
      request: {
        name: formValue.name,
        description: formValue.description || '',
      },
    });

    this.snackBar.open('Project updated successfully', 'Close', {
      duration: 3000,
    });

    this.router.navigate(['/projects', this.projectId()]);
  }

  onCancel(): void {
    this.router.navigate(['/projects', this.projectId()]);
  }
}
