import { Route } from '@angular/router';
import { AuthGuards } from '@ttrpg-ui/features/auth/util';
import { FeatureShellComponent } from './feature-shell.component';
import { PageDndNotFoundComponent } from '@ttrpg-ui/features/dnd/feature-shell';
import { PageDndSpellsViewAllComponent } from './pages/page-dnd-spells-view-all/page-dnd-spells-view-all.component';
import { PageDndSpellsCreateComponent } from './pages/page-dnd-spells-create/page-dnd-spells-create.component';
import { PageDndSpellsEditComponent } from './pages/page-dnd-spells-edit/page-dnd-spells-edit.component';
import { PageDndSpellsViewComponent } from './pages/page-dnd-spells-veiw/page-dnd-spells-view.component';

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
        path: 'spells/:id',
        canActivate: [AuthGuards.authGuard],
        component: PageDndSpellsViewComponent,
      },
      {
        path: 'spells/:id/edit',
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
