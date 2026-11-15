import { Route } from '@angular/router';
import { DndBackgroundsShellComponent } from './backgrounds-shell.component';
import { PageDndBackgroundsViewComponent } from './pages/page-dnd-backgrounds-view/page-dnd-backgrounds-view.component';
import { backgroundRouteResources } from '@ttrpg-ui/features/dnd/backgrounds/data-access';
import { PageDndBackgroundsViewAllComponent } from './pages/page-dnd-backgrounds-view-all/page-dnd-backgrounds-view-all.component';

/**
 * The backgrounds routes, lazy-loaded by the app under /dnd/backgrounds. Pages go in `children`.
 * An unknown path falls through to the app's not-found route.
 */
export const dndBackgroundsRoutes: Route[] = [
  {
    path: '',
    component: DndBackgroundsShellComponent,
    children: [
      { path: '', component: PageDndBackgroundsViewAllComponent },
      { path: ':source/:slug', component: PageDndBackgroundsViewComponent, resources: backgroundRouteResources },
    ],
  },
];
