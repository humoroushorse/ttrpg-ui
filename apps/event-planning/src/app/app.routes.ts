import { Route } from '@angular/router';
import { SharedPageNotFoundComponent } from '@ttrpg-ui/shared/page-not-found';

export const appRoutes: Route[] = [
  {
    path: 'event-planning',
    loadChildren: () =>
      import('features/event-planning/feature-shell/src').then((m) => m.featuresEventPlanningFeatureShellRoutes),
  },
  {
    path: '',
    redirectTo: 'event-planning',
    pathMatch: 'full',
  },
  { path: '**', component: SharedPageNotFoundComponent },
];
