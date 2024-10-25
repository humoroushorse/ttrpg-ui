import { Route } from '@angular/router';
import { FeaturesEventPlanningFeatureShellComponent } from './features-event-planning-feature-shell/features-event-planning-feature-shell.component';
import { PageEventPlanningGameEventViewAllComponent } from './pages/page-event-planning-game-event-view-all/page-event-planning-game-event-view-all.component';
import { PageEventPlanningGameEventViewComponent } from './pages/page-event-planning-game-event-view/page-event-planning-game-event-view.component';
import { PageEventPlanningGameEventEditComponent } from './pages/page-event-planning-game-event-edit/page-event-planning-game-event-edit.component';
import { PageEventPlanningNotFoundComponent } from './pages/page-event-planning-not-found/page-event-planning-not-found.component';
import { AuthGuards } from '@ttrpg-ui/features/auth/util';
import { PageEventPlanningGameSystemViewComponent } from './pages/page-event-planning-game-system-view/page-event-planning-game-system-view.component';
import { PageEventPlanningGameSystemViewAllComponent } from './pages/page-event-planning-game-system-view-all/page-event-planning-game-system-view-all.component';
import { PageEventPlanningGameSystemEditComponent } from './pages/page-event-planning-game-system-edit/page-event-planning-game-system-edit.component';
import { PageEventPlanningGameEventCreateComponent } from './pages/page-event-planning-game-event-create/page-event-planning-game-event-create.component';
import { PageEventPlanningGameSystemCreateComponent } from './pages/page-event-planning-game-system-create/page-event-planning-game-system-create.component';

export const featuresEventPlanningFeatureShellRoutes: Route[] = [
  {
    path: '',
    component: FeaturesEventPlanningFeatureShellComponent,
    canActivate: [],
    children: [
      { path: 'game-event', component: PageEventPlanningGameEventViewAllComponent },
      { path: 'game-event/create', component: PageEventPlanningGameEventCreateComponent },
      { path: 'game-event/:id', component: PageEventPlanningGameEventViewComponent },
      {
        path: 'game-event/:id/edit',
        canActivate: [AuthGuards.authGuard],
        component: PageEventPlanningGameEventEditComponent,
      },
      { path: 'game-system', component: PageEventPlanningGameSystemViewAllComponent },
      { path: 'game-system/create', component: PageEventPlanningGameSystemCreateComponent },
      { path: 'game-system/:id', component: PageEventPlanningGameSystemViewComponent },
      {
        path: 'game-system/:id/edit',
        canActivate: [AuthGuards.authGuard],
        component: PageEventPlanningGameSystemEditComponent,
      },
      // Defaults
      {
        path: '',
        redirectTo: 'game-event',
        pathMatch: 'full',
      },
      { path: '**', component: PageEventPlanningNotFoundComponent },
    ],
  },
];

export const featuresEventPlanningFeatureShellSidenavRoutes = [{ viewValue: 'Game Session', path: ['game-event'] }];
