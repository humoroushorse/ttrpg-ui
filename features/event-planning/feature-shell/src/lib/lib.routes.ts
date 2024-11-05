import { Route } from '@angular/router';
import { FeaturesEventPlanningFeatureShellComponent } from './features-event-planning-feature-shell/features-event-planning-feature-shell.component';
import { PageEventPlanningGameSessionViewAllComponent } from './pages/page-event-planning-game-session-view-all/page-event-planning-game-session-view-all.component';
import { PageEventPlanningGameSessionViewComponent } from './pages/page-event-planning-game-session-view/page-event-planning-game-session-view.component';
import { PageEventPlanningGameSessionEditComponent } from './pages/page-event-planning-game-session-edit/page-event-planning-game-session-edit.component';
import { PageEventPlanningNotFoundComponent } from './pages/page-event-planning-not-found/page-event-planning-not-found.component';
import { AuthGuards } from '@ttrpg-ui/features/auth/util';
import { PageEventPlanningGameSystemViewComponent } from './pages/page-event-planning-game-system-view/page-event-planning-game-system-view.component';
import { PageEventPlanningGameSystemViewAllComponent } from './pages/page-event-planning-game-system-view-all/page-event-planning-game-system-view-all.component';
import { PageEventPlanningGameSystemEditComponent } from './pages/page-event-planning-game-system-edit/page-event-planning-game-system-edit.component';
import { PageEventPlanningGameSessionCreateComponent } from './pages/page-event-planning-game-session-create/page-event-planning-game-session-create.component';
import { PageEventPlanningGameSystemCreateComponent } from './pages/page-event-planning-game-system-create/page-event-planning-game-system-create.component';

export const featuresEventPlanningFeatureShellRoutes: Route[] = [
  {
    path: '',
    component: FeaturesEventPlanningFeatureShellComponent,
    canActivate: [],
    children: [
      {
        path: 'game-session',
        component: PageEventPlanningGameSessionViewAllComponent,
      },
      {
        path: 'game-session/create',
        component: PageEventPlanningGameSessionCreateComponent,
        canActivate: [AuthGuards.authGuard],
      },
      {
        path: 'game-session/:id',
        component: PageEventPlanningGameSessionViewComponent,
      },
      {
        path: 'game-session/:id/edit',
        canActivate: [AuthGuards.authGuard],
        component: PageEventPlanningGameSessionEditComponent,
      },
      {
        path: 'game-system',
        component: PageEventPlanningGameSystemViewAllComponent,
      },
      {
        path: 'game-system/create',
        component: PageEventPlanningGameSystemCreateComponent,
        canActivate: [AuthGuards.authGuard],
      },
      {
        path: 'game-system/:id',
        component: PageEventPlanningGameSystemViewComponent,
      },
      {
        path: 'game-system/:id/edit',
        canActivate: [AuthGuards.authGuard],
        component: PageEventPlanningGameSystemEditComponent,
      },
      // Defaults
      {
        path: '',
        redirectTo: 'game-session',
        pathMatch: 'full',
      },
      { path: '**', component: PageEventPlanningNotFoundComponent },
    ],
  },
];

export const featuresEventPlanningFeatureShellSidenavRoutes = [{ viewValue: 'Game Session', path: ['game-session'] }];
