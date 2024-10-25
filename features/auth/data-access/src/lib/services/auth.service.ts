import { computed, inject, Injectable, signal } from '@angular/core';
import {
  AuthServiceConfig,
  AUTH_SERVICE_CONFIG_TOKEN,
  AuthResponse,
  UserIdToken,
} from '@ttrpg-ui/features/auth/models';
import { SharedCookieService } from '@ttrpg-ui/shared/cookie/data-access';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { interval, map, Observable, startWith, take } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { RegisterUserInput } from 'features/auth/models/src/lib/models/models';
import { SharedNotificationService } from '@ttrpg-ui/shared/notification/data-access';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly router = inject(Router);

  readonly sharedNotificationService = inject(SharedNotificationService);

  private authServiceConfig: AuthServiceConfig = inject(AUTH_SERVICE_CONFIG_TOKEN);

  public authGuardRedirectRoute = signal<string[]>(
    this.authServiceConfig.authGuardRedirectRoute || ['login'],
  ).asReadonly();

  public alreadyLoggedInGuardRedirectRoute = signal<string[]>(
    this.authServiceConfig.alreadyLoggedInGuardRedirectRoute || ['home'],
  ).asReadonly();

  private apiBaseUrl = computed(() => this.authServiceConfig.APP_TTRPG_EVENT_PLANNING__API_BASE_PATH);

  readonly http = inject(HttpClient);

  readonly sharedCookieService = inject(SharedCookieService);

  private userTokenDecoded = signal<UserIdToken | null>(this.getUserToken());

  public readonly refreshTokenAtSecondsRemaining = 150; // 2.5 minutes

  // NOTE: this will read from cookies every second (while in use)
  // TODO: maybe store the token end date when we get a new one and diff that instead every second
  public userTokenTimeRemaining$ = interval(1000).pipe(
    startWith(0),
    map(() => {
      return this.tokenTimeRemaining();
    }),
  );

  constructor() {
    this.periodicSessionRefresh();
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
        this.sharedCookieService.set<AuthResponse>('auth-info', next, { expires: expirationDate });
        if (next) this.router.navigate(this.alreadyLoggedInGuardRedirectRoute());
      },
    });
  }

  public getUserTokenDecoded() {
    return this.userTokenDecoded.asReadonly();
  }

  private getAuthResponse(): AuthResponse | null {
    return this.sharedCookieService.get<AuthResponse>('auth-info');
  }

  private periodicSessionRefresh() {
    const cookieAuthResponse = this.getAuthResponse();
    const tokenTimeRemaining = this.tokenTimeRemaining(cookieAuthResponse);
    if (tokenTimeRemaining === 0) {
      this.sharedCookieService.delete('auth-info');
      this.router.navigate(this.authGuardRedirectRoute());
      // this.sharedNotificationService.openSnackBar("You have been logged out because your token expired!")
      return;
    }
    if (cookieAuthResponse) {
      setTimeout(
        () => {
          this._postSessionRefresh()
            .pipe(take(1))
            .subscribe({
              next: (next) => {
                // in case the user logged out, stop refreshing the token
                this.userTokenDecoded.set(this.getUserToken(next.id_token));
                this.sharedCookieService.set<AuthResponse>('auth-info', next);
                console.log('ik-refreshed token!', next);
                if (cookieAuthResponse) {
                  this.periodicSessionRefresh();
                }
              },
            });
        },
        // expiresIn * 0.8 * 1000,
        // refresh when there's refreshTokenAtSecondsRemaining or immediately if less than that
        tokenTimeRemaining > this.refreshTokenAtSecondsRemaining
          ? (tokenTimeRemaining - this.refreshTokenAtSecondsRemaining) * 1000
          : 0,
      );
    }
  }

  private _postSessionRefresh() {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl()}/auth/session/refresh`, {});
  }

  public postSessionRefresh() {
    this._postSessionRefresh()
      .pipe(take(1))
      .subscribe({
        next: (next) => {
          this.userTokenDecoded.set(this.getUserToken(next.id_token));
          this.sharedCookieService.set<AuthResponse>('auth-info', next);
        },
      });
  }

  private _postSessionLogout() {
    return this.http.post<null>(`${this.apiBaseUrl()}/auth/session/logout`, {});
  }

  public postSessionLogout() {
    // TODO: figure out clearing these when the api works...
    this.userTokenDecoded.set(null);
    this.sharedCookieService.deleteAll();
    this._postSessionLogout()
      .pipe(take(1))
      .subscribe({
        next: () => {
          console.log('ik- logout next!');
          this.userTokenDecoded.set(null);
          this.sharedCookieService.delete('auth-info');
          this.router.navigate(this.authGuardRedirectRoute());
        },
        error: () => {
          console.log('ik- logout error!');
          // NOTE: the session won't be removed in this instance...
          this.userTokenDecoded.set(null);
          this.sharedCookieService.delete('auth-info');
          this.router.navigate(this.authGuardRedirectRoute());
        },
      });
  }

  private tokenTimeRemaining(res?: AuthResponse | null): number {
    const authResponse = res || this.getAuthResponse();
    if (!authResponse) return 0;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const userTokenDecoded = this.getUserToken(authResponse.id_token);
    if (!userTokenDecoded) return 0;
    const exp = (authResponse.refresh_expires_in || 0) + userTokenDecoded['iat'];
    // console.log({
    //   "refresh_expires_in": authResponse.refresh_expires_in || 0,
    //   "iat": userTokenDecoded['iat'],
    //   exp,
    //   currentTimestamp,
    //   "seconds remianing": exp - currentTimestamp,
    //   "minutes remaining": Math.floor((exp - currentTimestamp) / 60),
    // })
    if (exp < currentTimestamp) return 0;
    return exp - currentTimestamp;
  }

  public getUserToken(token: string | null = null): UserIdToken | null {
    if (!token) {
      const cookieAuthResponse = this.getAuthResponse();
      console.log(cookieAuthResponse);
      if (!cookieAuthResponse) return null;
      token = cookieAuthResponse.id_token;
    }
    try {
      return jwtDecode(token);
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
            this.router.navigate(this.authGuardRedirectRoute());
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
          this.userTokenDecoded.set(null);
          this.sharedCookieService.delete('auth-info');
          this.router.navigate(this.authGuardRedirectRoute());
        },
      });
  }
}
