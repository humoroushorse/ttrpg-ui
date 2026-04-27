import { Route } from '@angular/router';
import { AuthGuards } from '@ttrpg-ui/features/auth/util';
import { SprintManagementShellComponent } from './sprint-management-shell.component';

export const featuresSprintManagementFeatureShellRoutes: Route[] = [
  {
    path: '',
    component: SprintManagementShellComponent,
    children: [
      {
        path: '',
        redirectTo: 'board',
        pathMatch: 'full',
      },
      {
        path: 'board',
        loadComponent: () => import('./pages/board/page-board.component').then(m => m.PageBoardComponent),
        canActivate: [AuthGuards.authGuard],
      },
      {
        path: 'work-items/create',
        loadComponent: () => import('./pages/work-items/page-work-item-create.component').then(m => m.PageWorkItemCreateComponent),
        canActivate: [AuthGuards.authGuard],
      },
      {
        path: 'work-items/:id/edit',
        loadComponent: () => import('./pages/work-items/page-work-item-edit.component').then(m => m.PageWorkItemEditComponent),
        canActivate: [AuthGuards.authGuard],
        resolve: {
          workItem: () => import('./resolvers/work-item.resolver').then(m => m.workItemResolver),
        },
      },
      {
        path: 'work-items/:id',
        loadComponent: () => import('./pages/work-items/page-work-item-detail.component').then(m => m.PageWorkItemDetailComponent),
        canActivate: [AuthGuards.authGuard],
        resolve: {
          workItem: () => import('./resolvers/work-item.resolver').then(m => m.workItemResolver),
        },
      },
      {
        path: 'work-items',
        loadComponent: () => import('./pages/work-items/page-work-items-list.component').then(m => m.PageWorkItemsListComponent),
        canActivate: [AuthGuards.authGuard],
      },
      {
        path: 'sprints/create',
        loadComponent: () => import('./pages/sprints/page-sprint-create.component').then(m => m.PageSprintCreateComponent),
        canActivate: [AuthGuards.authGuard],
      },
      {
        path: 'sprints/:id/edit',
        loadComponent: () => import('./pages/sprints/page-sprint-edit.component').then(m => m.PageSprintEditComponent),
        canActivate: [AuthGuards.authGuard],
      },
      {
        path: 'sprints/:id',
        loadComponent: () => import('./pages/sprints/page-sprint-detail.component').then(m => m.PageSprintDetailComponent),
        canActivate: [AuthGuards.authGuard],
      },
      {
        path: 'sprints',
        loadComponent: () => import('./pages/sprints/page-sprints-list.component').then(m => m.PageSprintsListComponent),
        canActivate: [AuthGuards.authGuard],
      },
      {
        path: 'projects/create',
        loadComponent: () => import('./pages/projects/page-project-create.component').then(m => m.PageProjectCreateComponent),
        canActivate: [AuthGuards.authGuard],
      },
      {
        path: 'projects/:id/edit',
        loadComponent: () => import('./pages/projects/page-project-edit.component').then(m => m.PageProjectEditComponent),
        canActivate: [AuthGuards.authGuard],
      },
      {
        path: 'projects/:id',
        loadComponent: () => import('./pages/projects/page-project-detail.component').then(m => m.PageProjectDetailComponent),
        canActivate: [AuthGuards.authGuard],
      },
      {
        path: 'projects',
        loadComponent: () => import('./pages/projects/page-projects-list.component').then(m => m.PageProjectsListComponent),
        canActivate: [AuthGuards.authGuard],
      },
    ],
  },
];
