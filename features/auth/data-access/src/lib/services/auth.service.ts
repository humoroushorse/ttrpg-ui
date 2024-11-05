import { computed, inject, Injectable, signal } from '@angular/core';
import {
  AuthServiceConfig,
  AUTH_SERVICE_CONFIG_TOKEN,
  AuthResponse,
  UserIdToken,
} from '@ttrpg-ui/features/auth/models';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  interval,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  take,
  tap,
  throwError,
} from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { RegisterUserInput } from 'features/auth/models/src/lib/models/models';
import { SharedNotificationService } from '@ttrpg-ui/shared/notification/data-access';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private periodicSessionRefresh() {
    const tokenTimeRemaining = this.tokenTimeRemaining();
    if (tokenTimeRemaining.refresh <= 0) {
      this.deleteAuthInfo(false);
      // this.sharedNotificationService.openSnackBar("You have been logged out because your token expired!")
      return;
    }
    const timeRemaining =
      tokenTimeRemaining.auth > this.refreshTokenAtSecondsRemaining
        ? (tokenTimeRemaining.auth - this.refreshTokenAtSecondsRemaining) * 1000
        : 0;
    setTimeout(
      () => {
        this.postSessionRefreshTrigger.next(true);
      },
      Math.max(timeRemaining, 10000),
    );
  }

  public postSessionRefreshTrigger = new BehaviorSubject<boolean>(false);

  readonly router = inject(Router);

  readonly sharedNotificationService = inject(SharedNotificationService);

  readonly authServiceConfig: AuthServiceConfig = inject(AUTH_SERVICE_CONFIG_TOKEN);

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
    this.authServiceConfig.alreadyLoggedInGuardRedirectRoute || ['/', 'home'],
  ).asReadonly();

  private apiBaseUrl = computed(() => this.authServiceConfig.appConfig().APP_TTRPG_EVENT_PLANNING__API_BASE_PATH);

  readonly http = inject(HttpClient);

  readonly sharedLocalStorageService = inject(SharedLocalStorageService);

  private userTokenDecoded = signal<UserIdToken | null>(this.getUserToken());

  // public readonly refreshTokenAtSecondsRemaining = 150; // 2.5 minutes

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

  constructor() {
    // this.startTimer()
    this.userTokenDecoded.set(this.getUserToken());
    this.postSessionRefreshTrigger
      .pipe(
        debounceTime(1000), // max 1 query per second
        switchMap(() => {
          if (!this.getUserToken()) {
            return of(null);
          }
          return this._postSessionRefresh();
        }),
      )
      .subscribe((next) => {
        this.userTokenDecoded.set(this.getUserToken(next?.id_token));
        this.sharedLocalStorageService.set(this.authInfoKey, next);
        this.periodicSessionRefresh();
      });
    // this.userTokenDecoded.set(this.getUserToken());
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
        this.postSessionRefreshTrigger.next(true);
        if (next) this.router.navigate(this.alreadyLoggedInGuardRedirectRoute());
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

  public _postSessionRefresh() {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl()}/auth/session/refresh`, {}).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.message.toLocaleLowerCase().includes('token is not active')) {
          this.deleteAuthInfo(false);
        }
        return throwError(() => error);
      }),
      tap((next) => {
        this.userTokenDecoded.set(this.getUserToken(next.id_token));
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
      if (!cookieAuthResponse) return null;
      if (tokenTimeRemaining.refresh <= 0) {
        this.deleteAuthInfo(false);
        return null;
      }
      if (tokenTimeRemaining.auth <= 0) {
        this.postSessionRefreshTrigger.next(true);
      }
      token = cookieAuthResponse.id_token;
    }
    try {
      const decoded = jwtDecode<UserIdToken>(token);
      return decoded;
    } catch {
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
            this.sharedNotificationService.openSnackBar('Account successfully registered!');
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
}
