import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { SharedCoreServiceConfig, SHARED_CORE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/core/models';
import { debounceTime, fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class SharedCoreService {
  private sidenavOpened = signal<boolean>(false);

  private config: SharedCoreServiceConfig = inject(SHARED_CORE_SERVICE_CONFIG_TOKEN);

  private pageHeight = signal<number>(window.innerHeight);

  private pageWidth = signal<number>(window.innerWidth);

  private toolbarHeight = computed<number>(() => {
    return this.pageWidth() < 600 ? 52 : 60; // defults of the mat-toolbar anyways (v18)
  });

  public appTitle = this.config.appTitle;

  constructor() {
    fromEvent(window, 'resize')
      .pipe(takeUntilDestroyed(), debounceTime(300))
      .subscribe(() => {
        this.pageHeight.set(window.innerHeight);
        this.pageWidth.set(window.innerWidth);
      });
  }

  getToolbarHeight(): Signal<number> {
    return this.toolbarHeight;
  }

  getSidenavOpened(): Signal<boolean> {
    return this.sidenavOpened.asReadonly();
  }

  toggleSidenav(opened?: boolean): void {
    this.sidenavOpened.set(opened ?? !this.sidenavOpened());
  }

  getPageWidth(): Signal<number> {
    return this.pageWidth.asReadonly();
  }

  getPageHeight(): Signal<number> {
    return this.pageHeight.asReadonly();
  }
}
