import { Route } from '@angular/router';
import { AuthGuards } from '@ttrpg-ui/features/auth/util';
import { FeatureShellComponent } from './feature-shell.component';
import { PageDndNotFoundComponent } from '@ttrpg-ui/features/dnd/feature-shell';
import { PageDndSpellsViewAllComponent } from './pages/page-dnd-spells-view-all/page-dnd-spells-view-all.component';
import { PageDndSpellsCreateComponent } from './pages/page-dnd-spells-create/page-dnd-spells-create.component';
import { PageDndSpellsEditComponent } from './pages/page-dnd-spells-edit/page-dnd-spells-edit.component';
import { PageDndSpellsViewComponent } from './pages/page-dnd-spells-veiw/page-dnd-spells-view.component';
import { spellRouteResources } from '@ttrpg-ui/features/dnd/spells/data-access';

export const dndSpellRoutes: Route[] = [
  {
    path: '',
    component: FeatureShellComponent,
    canActivate: [],
    children: [
      {
        path: 'spells',
        component: PageDndSpellsViewAllComponent,
      },
      {
        path: 'spells/create',
        component: PageDndSpellsCreateComponent,
        canActivate: [AuthGuards.authGuard],
      },
      {
        // source slug + spell slug, e.g. spells/phb_2024/acid-splash
        path: 'spells/:source/:slug',
        component: PageDndSpellsViewComponent,
        resources: spellRouteResources,
      },
      {
        path: 'spells/:source/:slug/edit',
        component: PageDndSpellsEditComponent,
        canActivate: [AuthGuards.authGuard],
      },
      // Defaults
      {
        path: '',
        redirectTo: 'spells',
        pathMatch: 'full',
      },
      { path: '**', component: PageDndNotFoundComponent },
    ],
  },
];
