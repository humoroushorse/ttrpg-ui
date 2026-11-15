import { Route } from '@angular/router';
import { DndClassesShellComponent } from './classes-shell.component';
import { PageDndClassesViewComponent } from './pages/page-dnd-classes-view/page-dnd-classes-view.component';
import { classRouteResources } from '@ttrpg-ui/features/dnd/classes/data-access';
import { PageDndClassesViewAllComponent } from './pages/page-dnd-classes-view-all/page-dnd-classes-view-all.component';

/**
 * The classes routes, lazy-loaded by the app under /dnd/classes. Pages go in `children`.
 * An unknown path falls through to the app's not-found route.
 */
export const dndClassesRoutes: Route[] = [
  {
    path: '',
    component: DndClassesShellComponent,
    children: [
      { path: '', component: PageDndClassesViewAllComponent },
      { path: ':source/:slug', component: PageDndClassesViewComponent, resources: classRouteResources },
    ],
  },
];
