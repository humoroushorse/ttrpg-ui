import { inject, Injectable } from '@angular/core';
import { CookieOptions, CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class SharedCookieService {
  private cookieService = inject(CookieService);

  set<T>(key: string, value: T, options: CookieOptions = {}): void {
    this.cookieService.set(
      key,
      JSON.stringify(value),
      options.expires,
      options.path,
      options.domain,
      options.secure,
      options.sameSite,
      options.partitioned
    );
  }

  get<T>(key: string): T | null {
    const cookieValue = this.cookieService.get(key);
    if (!cookieValue) return null;
    return JSON.parse(cookieValue);
  }

  delete(key: string): void {
    this.cookieService.delete(key);
  }
}
