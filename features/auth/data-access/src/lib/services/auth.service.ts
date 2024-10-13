import { computed, inject, Injectable } from '@angular/core';
import { AuthServiceConfig, AUTH_SERVICE_CONFIG_TOKEN, AuthResponse  } from '@ttrpg-ui/features/auth/models';
import { SharedCookieService } from '@ttrpg-ui/shared/cookie/data-access';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { take, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authServiceConfig: AuthServiceConfig = inject(AUTH_SERVICE_CONFIG_TOKEN);

  private apiBaseUrl = computed(() => this.authServiceConfig.appConfig().APP_TTRPG_EVENT_PLANNING__API_BASE_PATH)

  private http = inject(HttpClient);

  private cookieService = inject(SharedCookieService);

  constructor() {
    this.periodicRefresh(0);
  }

  public login(username: string, password: string) {
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    return this.http.post<AuthResponse>(
      `${this.apiBaseUrl()}/auth/token`,
      body,
      { headers }
    ).pipe(
      tap(res => {
        this.cookieService.set<AuthResponse>('auth-info', res)
      })
    )
  }

  private periodicRefresh(expiresIn: number) {
    console.log('ik-expires', expiresIn)
    const cookieAuthResponse = this.cookieService.get<AuthResponse>('auth-info');
    if (cookieAuthResponse) {
    setTimeout(() => {
      this.refresh().pipe(take(1)).subscribe({
        next: (next) => {
          // in case the user logged out, stop refreshing the token
          if (cookieAuthResponse) {
            this.periodicRefresh(next.expires_in)
          }
        }
      })
    }, expiresIn * 0.8 * 1000);
    }
  }

  public refresh() {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl()}/auth/refresh`, {}).pipe(
      tap(res => {
        this.cookieService.set<AuthResponse>('auth-info', res)
      })
    )
  }

  public logout() {
    return this.http.post<null>(`${this.apiBaseUrl()}/auth/logout`, {}).pipe(
      tap(() => {
        this.cookieService.delete('auth-info')
      })
    )
  }

  public getUserToken() {
    const cookieAuthResponse = this.cookieService.get<AuthResponse>('auth-info');
    if (!cookieAuthResponse) return null;
    try {
      return jwtDecode(cookieAuthResponse.id_token);
    } catch (error) {
      console.error('Invalid token', error);
      return null;
    }
  }

  public getUser() {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ',
    });
    return this.http.get<AuthResponse>(`${this.apiBaseUrl()}/auth/user`, {headers})
  }
}
