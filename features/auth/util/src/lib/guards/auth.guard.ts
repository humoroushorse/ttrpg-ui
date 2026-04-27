import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';

export const authGuard: CanActivateFn = (_route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const platformId = inject(PLATFORM_ID);

  // Skip auth check during SSR - let the browser handle it
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // Synchronously check auth state - getUserToken() reads from localStorage
  const userToken = authService.getUserToken();
  const isLoggedIn = !!userToken;

  if (!isLoggedIn) {
    authService.setRedirectUrl(state.url);
    return router.createUrlTree(authService.authGuardAuthAppLoginRoute());
  }

  return true;
};
