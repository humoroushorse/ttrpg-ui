import { Route } from '@angular/router';
import { AuthGuards } from '@ttrpg-ui/features/auth/util';
import { DndCharactersShellComponent } from './characters-shell.component';
import { PageDndCharactersCreateComponent } from './pages/page-dnd-characters-create/page-dnd-characters-create.component';
import { PageDndCharactersViewComponent } from './pages/page-dnd-characters-view/page-dnd-characters-view.component';
import { characterRouteResources } from '@ttrpg-ui/features/dnd/characters/data-access';
import { PageDndCharactersViewAllComponent } from './pages/page-dnd-characters-view-all/page-dnd-characters-view-all.component';
import { PageDndCharactersBuildComponent } from './pages/page-dnd-characters-build/page-dnd-characters-build.component';

/**
 * The characters routes, lazy-loaded by the app under /dnd/characters. Pages go in `children`.
 * An unknown path falls through to the app's not-found route. Every page needs a login.
 */
export const dndCharactersRoutes: Route[] = [
  {
    path: '',
    component: DndCharactersShellComponent,
    canActivate: [AuthGuards.authGuard],
    children: [
      { path: '', component: PageDndCharactersViewAllComponent },
      { path: 'create', component: PageDndCharactersCreateComponent },
      { path: ':id', component: PageDndCharactersViewComponent, resources: characterRouteResources },
      { path: ':id/build', component: PageDndCharactersBuildComponent },
    ],
  },
];
