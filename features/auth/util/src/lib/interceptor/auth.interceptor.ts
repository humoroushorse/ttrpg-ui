import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { catchError, Observable, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  return next(req).pipe(
    // retry(1),
    catchError((error: HttpErrorResponse) => {
      const refreshTokenAttempted = req.headers.has('Refresh-Token-Attempted');
      if (refreshTokenAttempted) return throwError(() => error);

      if (error.status === 401) {
        // Refresh token logic
        return authService._postSessionRefresh().pipe(
          switchMap(() => {
            // Retry the original request with the new token
            const newRequest = req.clone({
              headers: req.headers.set('Refresh-Token-Attempted', 'true'),
            });
            return next(newRequest);
          }),
        );
      } else {
        return throwError(() => error);
      }
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
