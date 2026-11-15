import { Route } from '@angular/router';
import { DndSubclassesShellComponent } from './subclasses-shell.component';
import { PageDndSubclassesViewComponent } from './pages/page-dnd-subclasses-view/page-dnd-subclasses-view.component';
import { subclassRouteResources } from '@ttrpg-ui/features/dnd/subclasses/data-access';
import { PageDndSubclassesViewAllComponent } from './pages/page-dnd-subclasses-view-all/page-dnd-subclasses-view-all.component';

/**
 * The subclasses routes, lazy-loaded by the app under /dnd/subclasses. Pages go in `children`.
 * An unknown path falls through to the app's not-found route.
 */
export const dndSubclassesRoutes: Route[] = [
  {
    path: '',
    component: DndSubclassesShellComponent,
    children: [
      { path: '', component: PageDndSubclassesViewAllComponent },
      { path: ':source/:slug', component: PageDndSubclassesViewComponent, resources: subclassRouteResources },
    ],
  },
];
