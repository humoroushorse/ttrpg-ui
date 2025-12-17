import { Route } from '@angular/router';
import { SharedPageNotFoundComponent } from '@ttrpg-ui/shared/page-not-found';

// NOTE: please update ../sitemap.xml as needed...
export const appRoutes: Route[] = [
  {
    path: 'dnd',
    loadChildren: () => import('features/dnd/spells/feature-shell/src').then((m) => m.dndSpellRoutes),
  },
  {
    path: 'home',
    redirectTo: 'dnd',
  },
  {
    path: 'user',
    loadChildren: () => import('@ttrpg-ui/features/user/feature-shell').then((m) => m.featuresUserFeatureShellRoutes),
  },
  {
    path: 'auth',
    loadChildren: () => import('@ttrpg-ui/features/auth/feature-shell').then((m) => m.featuresAuthFeatureShellRoutes),
  },
  {
    path: '',
    redirectTo: 'dnd',
    pathMatch: 'full',
  },
  { path: '**', component: SharedPageNotFoundComponent },
];
