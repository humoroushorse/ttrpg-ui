import { PlatformLocation } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { CookieOptions, CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class SharedCookieService {
  private cookieService = inject(CookieService);

  readonly platformLocation = inject(PlatformLocation);

  set<T>(key: string, value: T, options: CookieOptions = {}): void {
    if (!options.path) options.path = this.platformLocation.getBaseHrefFromDOM();
    // if (!options.domain) options.domain = location.origin;
    this.cookieService.set(
      key,
      JSON.stringify(value),
      options.expires,
      options.path,
      options.domain,
      options.secure,
      options.sameSite,
      options.partitioned,
    );
  }

  get<T>(key: string): T | null {
    const cookieValue = this.cookieService.get(key);
    if (!cookieValue) return null;
    return JSON.parse(cookieValue);
  }

  delete(
    key: string,
    path = this.platformLocation.getBaseHrefFromDOM(),
    domain: string | undefined = undefined,
    // domain=location.origin,
    secure = false,
    sameSite = undefined,
  ): void {
    this.cookieService.delete(key, path, domain, secure, sameSite);
  }

  deleteAll(): void {
    this.cookieService.deleteAll();
  }
}
