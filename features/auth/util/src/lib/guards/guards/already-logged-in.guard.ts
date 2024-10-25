import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';

export const alreadyLoggedInGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const userToken = authService.getUserToken();
  console.log(userToken);
  const isLoggedIn = !!userToken;
  return !isLoggedIn || router.createUrlTree(authService.alreadyLoggedInGuardRedirectRoute());
};

// export function alreadyLoggedInGuard(
//   redirectRoute: string
// ): CanActivateFn {
//   return () => {
//     const authService = inject(AuthService);
//     const router = inject(Router);
//     const authResponse = authService.getAuthResponse();
//     const isLoggedIn = !!authResponse()
//     return !isLoggedIn || router.createUrlTree([redirectRoute]);
//   };
// }
