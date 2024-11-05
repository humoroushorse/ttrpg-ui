import { Route } from '@angular/router';
import { FeaturesAuthFeatureShellComponent } from './features-auth-feature-shell/features-auth-feature-shell.component';
import { PageAuthLoginComponent } from './pages/page-auth-login/page-auth-login.component';
import { PageAuthUnauthorizedComponent } from './pages/page-auth-unauthorized/page-auth-unauthorized.component';
import { PageAuthRegisterComponent } from './pages/page-auth-register/page-auth-register.component';
import { PageAuthForgotPasswordComponent } from './pages/page-auth-forgot-password/page-auth-forgot-password.component';
import { AuthGuards } from '@ttrpg-ui/features/auth/util';

// export const featuresAuthFeatureShellRoutes: Route[] = [
//   { path: 'login', component: PageAuthLoginComponent },
//   { path: 'unauthorized', component: PageAuthUnauthorizedComponent },
// ];

export const featuresAuthFeatureShellRoutes: Route[] = [
  {
    path: '',
    component: FeaturesAuthFeatureShellComponent,
    canActivate: [],
    children: [
      {
        path: 'login',
        canActivate: [AuthGuards.alreadyLoggedInGuard],
        component: PageAuthLoginComponent,
      },
      { path: 'register', component: PageAuthRegisterComponent },
      { path: 'unauthorized', component: PageAuthUnauthorizedComponent },
      { path: 'forgot-password', component: PageAuthForgotPasswordComponent },
      // Defaults
      // { path: '**', component: PageAuthNotFoundComponent },
    ],
  },
];
