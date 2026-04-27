import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { ProjectStore } from '@ttrpg-ui/features/sprint-management/data-access';

@Component({
  selector: 'lib-page-projects-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatPaginatorModule,
  ],
  templateUrl: './page-projects-list.component.html',
  styleUrls: ['./page-projects-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageProjectsListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly sharedCoreService = inject(SharedCoreService);
  private readonly snackBar = inject(MatSnackBar);
  public readonly projectStore = inject(ProjectStore);
  public readonly authService = inject(AuthService);

  public currentView = signal<'grid' | 'list'>('grid');

  public projects = computed(() => this.projectStore.projectsSorted());
  public loading = computed(() => this.projectStore.loading());
  public pagination = computed(() => this.projectStore.pagination());

  ngOnInit(): void {
    this.title.setTitle(`Sprint Management | Projects | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({
      name: 'description',
      content: 'Manage projects for organizing work items.',
    });

    this.loadProjects();
  }

  loadProjects(): void {
    const pagination = this.projectStore.pagination();
    this.projectStore.loadProjects({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
    });
  }

  onPageChange(event: PageEvent): void {
    this.projectStore.setPage(event.pageIndex + 1);
    this.projectStore.setPageSize(event.pageSize);
    this.loadProjects();
  }

  onCreateClicked(): void {
    this.router.navigate(['/projects/create']);
  }

  onProjectClicked(projectId: string): void {
    this.router.navigate(['/projects', projectId]);
  }

  onEditClicked(projectId: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/projects', projectId, 'edit']);
  }

  onDeleteClicked(projectId: string, projectName: string, event: Event): void {
    event.stopPropagation();

    const confirmed = confirm(
      `Are you sure you want to delete project "${projectName}"? This will not delete work items, but they will lose their project association.`,
    );

    if (!confirmed) return;

    this.projectStore.delete(projectId);

    this.snackBar.open('Project deleted successfully', 'Close', {
      duration: 3000,
    });
  }

  toggleView(): void {
    this.currentView.update((view) => (view === 'grid' ? 'list' : 'grid'));
  }
}
