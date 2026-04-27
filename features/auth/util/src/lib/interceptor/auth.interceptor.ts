import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { catchError, Observable, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';

// Subject to track if a refresh is in progress
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  // Don't intercept refresh or logout requests
  if (req.url.includes('/auth/session/refresh') || req.url.includes('/auth/session/logout')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Skip interceptor logic during SSR
      if (!isBrowser) {
        return throwError(() => error);
      }

      if (error.status !== 401) {
        return throwError(() => error);
      }

      console.warn('[AuthInterceptor] 401 on', req.method, req.url, '— attempting token refresh');

      // Check refresh token
      const userToken = authService.getUserToken();
      if (!userToken) {
        console.warn('[AuthInterceptor] No refresh token available, forcing logout');
        authService.forceLogout();
        return throwError(() => error);
      }

      // If refreshing, wait for it first
      if (isRefreshing) {
        console.debug('[AuthInterceptor] Refresh already in progress, queuing request:', req.url);
        return refreshTokenSubject.pipe(
          filter((token) => token !== null),
          take(1),
          switchMap(() => {
            console.debug('[AuthInterceptor] Retrying queued request after refresh:', req.url);
            return next(req);
          }),
        );
      }

      // Start refreshing
      isRefreshing = true;
      refreshTokenSubject.next(null);
      console.debug('[AuthInterceptor] Starting token refresh');

      return authService._postSessionRefresh().pipe(
        switchMap((authResponse) => {
          if (!authResponse) {
            isRefreshing = false;
            console.warn('[AuthInterceptor] Token refresh returned no response, forcing logout');
            authService.forceLogout();
            return throwError(() => error);
          }

          isRefreshing = false;
          refreshTokenSubject.next(authResponse.id_token);
          console.debug('[AuthInterceptor] Token refreshed, retrying:', req.url);

          // Retry the original request
          return next(req);
        }),
        catchError((refreshError) => {
          isRefreshing = false;
          refreshTokenSubject.next(null);
          console.error('[AuthInterceptor] Token refresh failed:', refreshError);
          authService.forceLogout();
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  readonly authService = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.authService._postSessionRefresh().pipe(
            switchMap(() => {
              const newRequest = req.clone();
              return next.handle(newRequest);
            }),
          );
        } else {
          return throwError(() => error);
        }
      }),
    );
  }
}
