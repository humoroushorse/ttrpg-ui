import { Route } from '@angular/router';
import { DndFeatsShellComponent } from './feats-shell.component';
import { PageDndFeatsViewComponent } from './pages/page-dnd-feats-view/page-dnd-feats-view.component';
import { featRouteResources } from '@ttrpg-ui/features/dnd/feats/data-access';
import { PageDndFeatsViewAllComponent } from './pages/page-dnd-feats-view-all/page-dnd-feats-view-all.component';

/**
 * The feats routes, lazy-loaded by the app under /dnd/feats. Pages go in `children`.
 * An unknown path falls through to the app's not-found route.
 */
export const dndFeatsRoutes: Route[] = [
  {
    path: '',
    component: DndFeatsShellComponent,
    children: [
      { path: '', component: PageDndFeatsViewAllComponent },
      { path: ':source/:slug', component: PageDndFeatsViewComponent, resources: featRouteResources },
    ],
  },
];
