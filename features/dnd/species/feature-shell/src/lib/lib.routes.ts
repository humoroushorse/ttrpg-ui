import { Route } from '@angular/router';
import { DndSpeciesShellComponent } from './species-shell.component';
import { PageDndSpeciesViewComponent } from './pages/page-dnd-species-view/page-dnd-species-view.component';
import { speciesRouteResources } from '@ttrpg-ui/features/dnd/species/data-access';
import { PageDndSpeciesViewAllComponent } from './pages/page-dnd-species-view-all/page-dnd-species-view-all.component';

/**
 * The species routes, lazy-loaded by the app under /dnd/species. Pages go in `children`.
 * An unknown path falls through to the app's not-found route.
 */
export const dndSpeciesRoutes: Route[] = [
  {
    path: '',
    component: DndSpeciesShellComponent,
    children: [
      { path: '', component: PageDndSpeciesViewAllComponent },
      { path: ':source/:slug', component: PageDndSpeciesViewComponent, resources: speciesRouteResources },
    ],
  },
];
