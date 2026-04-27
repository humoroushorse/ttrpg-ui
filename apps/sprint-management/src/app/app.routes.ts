import { Route } from '@angular/router';

const PageNotFoundComponent = () =>
  import('@ttrpg-ui/shared/page-not-found').then((m) => m.SharedPageNotFoundComponent);

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () =>
      import('@ttrpg-ui/features/sprint-management/feature-shell').then(
        (m) => m.featuresSprintManagementFeatureShellRoutes,
      ),
  },
  {
    path: 'auth',
    loadChildren: () => import('@ttrpg-ui/features/auth/feature-shell').then((m) => m.featuresAuthFeatureShellRoutes),
  },
  {
    path: 'user',
    loadChildren: () => import('@ttrpg-ui/features/user/feature-shell').then((m) => m.featuresUserFeatureShellRoutes),
  },
  {
    path: '**',
    loadComponent: PageNotFoundComponent,
  },
];
