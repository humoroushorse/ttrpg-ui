import { Route } from '@angular/router';
import { AuthGuards } from '@ttrpg-ui/features/auth/util';
import { DndCampaignsShellComponent } from './campaigns-shell.component';
import { PageDndCampaignsCreateComponent } from './pages/page-dnd-campaigns-create/page-dnd-campaigns-create.component';
import { PageDndCampaignsEditComponent } from './pages/page-dnd-campaigns-edit/page-dnd-campaigns-edit.component';
import { campaignRouteResources } from '@ttrpg-ui/features/dnd/campaigns/data-access';
import { PageDndCampaignsViewComponent } from './pages/page-dnd-campaigns-view/page-dnd-campaigns-view.component';
import { PageDndCampaignsViewAllComponent } from './pages/page-dnd-campaigns-view-all/page-dnd-campaigns-view-all.component';
import { PageDndCampaignsJoinComponent } from './pages/page-dnd-campaigns-join/page-dnd-campaigns-join.component';

/**
 * The campaigns routes, lazy-loaded by the app under /dnd/campaigns. Pages go in `children`.
 * An unknown path falls through to the app's not-found route. Every page needs a login.
 */
export const dndCampaignsRoutes: Route[] = [
  {
    path: '',
    component: DndCampaignsShellComponent,
    canActivate: [AuthGuards.authGuard],
    children: [
      { path: 'join/:token', component: PageDndCampaignsJoinComponent },
      { path: '', component: PageDndCampaignsViewAllComponent },
      { path: 'create', component: PageDndCampaignsCreateComponent },
      { path: ':id/edit', component: PageDndCampaignsEditComponent, resources: campaignRouteResources },
      { path: ':id', component: PageDndCampaignsViewComponent, resources: campaignRouteResources },
    ],
  },
];
