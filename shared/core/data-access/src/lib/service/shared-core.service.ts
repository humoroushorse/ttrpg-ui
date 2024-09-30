import { inject, Injectable, Signal, signal } from '@angular/core';
import { SharedCoreServiceConfig, SHARED_CORE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/core/models';

@Injectable({
  providedIn: 'root',
})
export class SharedCoreService {
  private toolbarHeight$ = signal<number>(64);

  private sidenavOpened$ = signal<boolean>(false);

  private config: SharedCoreServiceConfig = inject(SHARED_CORE_SERVICE_CONFIG_TOKEN);

  public appTitle = this.config.appTitle;

  getToolbarHeight(): Signal<number> {
    return this.toolbarHeight$.asReadonly();
  }

  getSidenavOpened(): Signal<boolean> {
    return this.sidenavOpened$.asReadonly();
  }

  toggleSidenav(opened?: boolean): void {
    this.sidenavOpened$.set(opened ?? !this.sidenavOpened$());
  }
}
