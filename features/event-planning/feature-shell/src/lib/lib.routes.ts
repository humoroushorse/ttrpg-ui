import { Route } from '@angular/router';
import { FeaturesEventPlanningFeatureShellComponent } from './features-event-planning-feature-shell/features-event-planning-feature-shell.component';
import { PageEventPlanningGameEventViewAllComponent } from './pages/page-event-planning-game-event-view-all/page-event-planning-game-event-view-all.component';
import { PageEventPlanningGameEventViewComponent } from './pages/page-event-planning-game-event-view/page-event-planning-game-event-view.component';
import { PageEventPlanningGameEventEditComponent } from './pages/page-event-planning-game-event-edit/page-event-planning-game-event-edit.component';
import { PageEventPlanningNotFoundComponent } from './pages/page-event-planning-not-found/page-event-planning-not-found.component';

export const featuresEventPlanningFeatureShellRoutes: Route[] = [
  {
    path: '',
    component: FeaturesEventPlanningFeatureShellComponent,
    canActivate: [],
    children: [
      { path: 'game-event', component: PageEventPlanningGameEventViewAllComponent },
      { path: 'game-event/:id', component: PageEventPlanningGameEventViewComponent },
      { path: 'game-event/:id/edit', component: PageEventPlanningGameEventEditComponent },
      // Defaults
      {
        path: '',
        redirectTo: 'game-event',
        pathMatch: 'full'
      },
      { path: '**', component: PageEventPlanningNotFoundComponent }
    ]
  },
];
