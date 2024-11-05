import { Route } from '@angular/router';
import { FeaturesUserFeatureShellComponent } from './features-user-feature-shell/features-user-feature-shell.component';
import { PageUserSettingsComponent } from './pages/page-user-settings.component';
import { AuthGuards } from '@ttrpg-ui/features/auth/util';

export const featuresUserFeatureShellRoutes: Route[] = [
  {
    path: '',
    component: FeaturesUserFeatureShellComponent,
    canActivate: [],
    children: [
      {
        path: 'settings',
        component: PageUserSettingsComponent,
        canActivate: [AuthGuards.authGuard],
      },
      // Defaults
      // { path: '**', component: PageAuthNotFoundComponent },
    ],
  },
];

export const featuresUserFeatureShellSidenavRoutes = [{ viewValue: 'User Settings', path: ['user', 'settings'] }];
