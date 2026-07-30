import { computed, inject, Injectable, signal } from '@angular/core';
import {
  AuthServiceConfig,
  AUTH_SERVICE_CONFIG_TOKEN,
  AuthResponse,
  UserIdToken,
} from '@ttrpg-ui/features/auth/models';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, interval, map, Observable, of, startWith, take, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { RegisterUserInput } from 'features/auth/models/src/lib/models/models';
import { SharedNotificationService } from '@ttrpg-ui/shared/notification/data-access';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { UserModels } from '@ttrpg-ui/features/user/models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Removed proactive refresh - now handled by HTTP interceptor on 401 errors

  private readonly router = inject(Router);

  private readonly sharedNotificationService = inject(SharedNotificationService);

  private readonly authServiceConfig: AuthServiceConfig = inject(AUTH_SERVICE_CONFIG_TOKEN);

  public authGuardAuthAppBaseRoute = signal<string[]>(
    this.authServiceConfig.authGuardAuthAppRouteBase ? [...this.authServiceConfig.authGuardAuthAppRouteBase] : ['/'],
  ).asReadonly();

  public authGuardAuthAppLoginRoute = computed<string[]>(() => {
    return [...this.authGuardAuthAppBaseRoute(), 'login'];
  });

  public authGuardAuthAppRegisterRoute = computed<string[]>(() => {
    return [...this.authGuardAuthAppBaseRoute(), 'register'];
  });

  public alreadyLoggedInGuardRedirectRoute = signal<string[]>(
    this.authServiceConfig.alreadyLoggedInGuardRedirectRoute ?? ['/', 'home'],
  ).asReadonly();

  private apiBaseUrl = computed(() => this.authServiceConfig.appConfig().AUTH_BASE_URL || '');

  private readonly http = inject(HttpClient);

  private readonly sharedLocalStorageService = inject(SharedLocalStorageService);

  private userTokenDecoded = signal<UserIdToken | null>(this.getUserToken());

  public readonly refreshTokenAtSecondsRemaining = 30;

  // NOTE: this will read from cookies every second (while in use)
  // TODO: maybe store the token end date when we get a new one and diff that instead every second
  public userTokenTimeRemaining$ = interval(1000).pipe(
    startWith(0),
    map(() => {
      return this.tokenTimeRemaining();
    }),
  );

  readonly authInfoKey = 'AuthService.userTokenDecoded';
  private readonly redirectUrlKey = 'redirectUrl';

  constructor() {
    this.userTokenDecoded.set(this.getUserToken());
  }

  public _postSessionLogin(username: string, password: string) {
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    return this.http.post<AuthResponse>(`${this.apiBaseUrl()}/auth/session/token`, body, { headers });
  }

  public postSessionLogin(username: string, password: string) {
    this._postSessionLogin(username, password).subscribe({
      next: (next) => {
        this.userTokenDecoded.set(this.getUserToken(next.id_token));
        // cookie expiration
        const expiresInSeconds = next.refresh_expires_in; // Get expiration time from Keycloak response
        const expirationDate = new Date();
        expirationDate.setSeconds(expirationDate.getSeconds() + expiresInSeconds);
        this.sharedLocalStorageService.set<AuthResponse>(this.authInfoKey, next);

        // Check if there's a redirect URL stored BEFORE any navigation
        const redirectUrl = this.getRedirectUrl();

        if (redirectUrl) {
          this.clearRedirectUrl();
          this.router.navigateByUrl(redirectUrl);
        } else {
          this.router.navigate(this.alreadyLoggedInGuardRedirectRoute());
        }
      },
    });
  }

  public getUserTokenDecoded() {
    return this.userTokenDecoded.asReadonly();
  }

  private getAuthResponse(): AuthResponse | null {
    return this.sharedLocalStorageService.get<AuthResponse>(this.authInfoKey);
  }

  private deleteAuthInfo(routeToLogin = true) {
    this.userTokenDecoded.set(null);
    this.sharedLocalStorageService.remove(this.authInfoKey);
    this.sharedLocalStorageService.clearNamespace(); // todo: is this overkill?
    if (routeToLogin) this.router.navigate(this.authGuardAuthAppLoginRoute());
  }

  public forceLogout() {
    this.deleteAuthInfo();
  }

  public setRedirectUrl(url: string): void {
    this.sharedLocalStorageService.setPersistent(this.redirectUrlKey, url);
  }

  public getRedirectUrl(): string | null {
    return this.sharedLocalStorageService.getPersistent<string>(this.redirectUrlKey);
  }

  public clearRedirectUrl(): void {
    this.sharedLocalStorageService.removePersistent(this.redirectUrlKey);
  }

  public _postSessionRefresh() {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl()}/auth/session/refresh`, {}).pipe(
      catchError((error: HttpErrorResponse) => {
        // Silently handle 404 errors (endpoint not found) - don't throw
        if (error.status === 404) {
          console.warn('Auth refresh endpoint not available:', error.message);
          return of(null as any);
        }

        // For 401 errors, the refresh token is invalid - return null so interceptor logs out
        if (error.status === 401) {
          console.warn('Refresh token invalid or expired, logging out');
          return of(null as any);
        }

        return throwError(() => error);
      }),
      tap((next) => {
        if (next) {
          this.userTokenDecoded.set(this.getUserToken(next.id_token));
        }
      }),
    );
  }

  private _postSessionLogout() {
    return this.http.post<null>(`${this.apiBaseUrl()}/auth/session/logout`, {});
  }

  public postSessionLogout() {
    this._postSessionLogout()
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.deleteAuthInfo();
        },
        error: () => {
          // NOTE: the session won't be removed in this instance...
          this.deleteAuthInfo();
        },
      });
  }

  private tokenTimeRemaining(res?: AuthResponse | null): { auth: number; refresh: number } {
    const authResponse = res || this.getAuthResponse();
    if (!authResponse) return { auth: 0, refresh: 0 };
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const userTokenDecoded = this.getUserToken(authResponse.id_token);
    if (!userTokenDecoded) return { auth: 0, refresh: 0 };
    const authExp = (authResponse.expires_in || 0) + userTokenDecoded['iat'];
    const refreshExp = (authResponse.refresh_expires_in || 0) + userTokenDecoded['iat'];
    return {
      auth: Math.max(authExp - currentTimestamp, 0),
      refresh: Math.max(refreshExp - currentTimestamp, 0),
    };
  }

  public getUserToken(token: string | null = null): UserIdToken | null {
    if (!token) {
      const cookieAuthResponse = this.getAuthResponse();
      const tokenTimeRemaining = this.tokenTimeRemaining(cookieAuthResponse);

      if (!cookieAuthResponse) {
        return null;
      }

      if (tokenTimeRemaining.refresh <= 0) {
        this.deleteAuthInfo(false);
        return null;
      }

      // Don't proactively refresh - let backend 401 trigger refresh via interceptor
      token = cookieAuthResponse.id_token;
    }

    try {
      const decoded = this.decodeJwt<UserIdToken>(token);
      return decoded;
    } catch (error) {
      console.error('[AuthService] Failed to decode token:', error);
      return null;
    }
  }

  public getUser() {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ',
    });
    return this.http.get<AuthResponse>(`${this.apiBaseUrl()}/auth/user`, { headers });
  }

  private _postUser(user: RegisterUserInput): Observable<string> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ',
    });
    return this.http.post<string>(`${this.apiBaseUrl()}/auth/user`, user, { headers });
  }

  public postUser(user: RegisterUserInput): void {
    this._postUser(user)
      .pipe(take(1))
      .subscribe({
        // next: () => { this.postSessionLogin(user.userName, user.password) }
        next: (next) => {
          if (next) {
            this.sharedNotificationService.openSnackBar('Account successfully registered!', 'close');
            this.router.navigate(this.authGuardAuthAppLoginRoute());
          }
        },
      });
  }

  private _deleteUser(): Observable<null> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ',
    });
    return this.http.delete<null>(`${this.apiBaseUrl()}/auth/user`, { headers });
  }

  public deleteUser(): void {
    this._deleteUser()
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.deleteAuthInfo();
        },
      });
  }

  getCurrentUser(): Observable<UserModels.Schemas.UserSchema | null> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http
      .get<UserModels.Schemas.UserSchema>(`${this.apiBaseUrl()}/auth/user`, {
        headers,
        observe: 'response',
      })
      .pipe(map((r) => r.body));
  }

  updateCurrentUser(body: UserModels.Schemas.PutUserInput): Observable<UserModels.Schemas.UserSchema | null> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http
      .put<UserModels.Schemas.UserSchema>(`${this.apiBaseUrl()}/auth/user`, body, {
        headers,
        observe: 'response',
      })
      .pipe(map((r) => r.body));
  }

  private decodeJwt<T>(token: string): T {
    const [, payload] = token.split('.');

    if (!payload) {
      throw new Error('Invalid JWT');
    }

    const base64 = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );

    return JSON.parse(json) as T;
  }
}
