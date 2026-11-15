import { Route } from '@angular/router';
import { DndItemsShellComponent } from './items-shell.component';
import { PageDndItemsViewComponent } from './pages/page-dnd-items-view/page-dnd-items-view.component';
import { itemRouteResources } from '@ttrpg-ui/features/dnd/items/data-access';
import { PageDndItemsViewAllComponent } from './pages/page-dnd-items-view-all/page-dnd-items-view-all.component';

/**
 * The items routes, lazy-loaded by the app under /dnd/items. Pages go in `children`.
 * An unknown path falls through to the app's not-found route.
 */
export const dndItemsRoutes: Route[] = [
  {
    path: '',
    component: DndItemsShellComponent,
    children: [
      { path: '', component: PageDndItemsViewAllComponent },
      { path: ':source/:slug', component: PageDndItemsViewComponent, resources: itemRouteResources },
    ],
  },
];
