import { Route } from '@angular/router';
import { SharedPageNotFoundComponent } from '@ttrpg-ui/shared/page-not-found';

export const appRoutes: Route[] = [
  {
    path: 'event-planning',
    loadChildren: () =>
      import('features/event-planning/feature-shell/src').then((m) => m.featuresEventPlanningFeatureShellRoutes),
  },
  {
    path: 'home',
    redirectTo: 'event-planning',
  },
  {
    path: 'user',
    loadChildren: () => import('@ttrpg-ui/features/user/feature-shell').then((m) => m.featuresUserFeatureShellRoutes),
  },
  {
    path: '',
    loadChildren: () => import('@ttrpg-ui/features/auth/feature-shell').then((m) => m.featuresAuthFeatureShellRoutes),
  },
  {
    path: '',
    redirectTo: 'event-planning',
    pathMatch: 'full',
  },
  { path: '**', component: SharedPageNotFoundComponent },
];
