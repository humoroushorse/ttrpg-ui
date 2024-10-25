import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';

export const authGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const userToken = authService.getUserToken();
  const isLoggedIn = !!userToken;
  return isLoggedIn || router.createUrlTree(authService.authGuardRedirectRoute());
};

// export function authGuard(): CanActivateFn {
//   return () => {
//     const router = inject(Router);
//     const authService = inject(AuthService);
//     const authResponse = authService.getAuthResponse();
//     const isLoggedIn = !!authResponse()
//     return isLoggedIn || router.createUrlTree([authService.authGuardRedirectRoute()]);
//   };
// }
