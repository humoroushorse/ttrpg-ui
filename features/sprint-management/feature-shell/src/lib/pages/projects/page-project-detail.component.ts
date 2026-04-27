import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { ProjectStore } from '@ttrpg-ui/features/sprint-management/data-access';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

type Project = SprintModels.Project.Project;

@Component({
  selector: 'lib-page-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
  ],
  templateUrl: './page-project-detail.component.html',
  styleUrls: ['./page-project-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageProjectDetailComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly sharedCoreService = inject(SharedCoreService);
  readonly projectStore = inject(ProjectStore);

  projectId = signal<string>('');
  loading = signal<boolean>(true);
  project = signal<Project | null>(null);

  ngOnInit(): void {
    this.title.setTitle(
      `Sprint Management | Project Details | ${this.sharedCoreService.appTitle}`
    );
    this.meta.updateTag({
      name: 'description',
      content: 'View project details and work items.',
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
        this.project.set(project);
        this.loading.set(false);
      }
    }, 500);
  }

  onEdit(): void {
    this.router.navigate(['/projects', this.projectId(), 'edit']);
  }

  onBack(): void {
    this.router.navigate(['/projects']);
  }
}
