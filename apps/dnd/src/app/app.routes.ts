import { Route } from '@angular/router';
import { SharedPageNotFoundComponent } from '@ttrpg-ui/shared/page-not-found';

// NOTE: please update ../sitemap.xml as needed...
export const appRoutes: Route[] = [
  {
    path: 'dnd/campaigns',
    loadChildren: () => import('@ttrpg-ui/features/dnd/campaigns/feature-shell').then((m) => m.dndCampaignsRoutes),
  },
  {
    path: 'dnd/characters',
    loadChildren: () => import('@ttrpg-ui/features/dnd/characters/feature-shell').then((m) => m.dndCharactersRoutes),
  },
  {
    path: 'dnd/items',
    loadChildren: () => import('@ttrpg-ui/features/dnd/items/feature-shell').then((m) => m.dndItemsRoutes),
  },
  {
    path: 'dnd/feats',
    loadChildren: () => import('@ttrpg-ui/features/dnd/feats/feature-shell').then((m) => m.dndFeatsRoutes),
  },
  {
    path: 'dnd/backgrounds',
    loadChildren: () => import('@ttrpg-ui/features/dnd/backgrounds/feature-shell').then((m) => m.dndBackgroundsRoutes),
  },
  {
    path: 'dnd/species',
    loadChildren: () => import('@ttrpg-ui/features/dnd/species/feature-shell').then((m) => m.dndSpeciesRoutes),
  },
  {
    path: 'dnd/subclasses',
    loadChildren: () => import('@ttrpg-ui/features/dnd/subclasses/feature-shell').then((m) => m.dndSubclassesRoutes),
  },
  {
    path: 'dnd/classes',
    loadChildren: () => import('@ttrpg-ui/features/dnd/classes/feature-shell').then((m) => m.dndClassesRoutes),
  },
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
