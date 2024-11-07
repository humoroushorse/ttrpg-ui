import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { SharedCoreServiceConfig, SHARED_CORE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/core/models';
import { debounceTime, fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class SharedCoreService {
  private config: SharedCoreServiceConfig = inject(SHARED_CORE_SERVICE_CONFIG_TOKEN);

  private pageHeight = signal<number>(window.innerHeight);

  private pageWidth = signal<number>(window.innerWidth);

  private toolbarHeight = computed<number>(() => {
    // defults of the mat-toolbar anyways (v18)
    // return this.pageWidth() < 600 ? 52 : 60;
    // change at 640px which is sm media size from tailwindcss (v3.4.13)
    return this.pageWidth() < 640 ? 52 : 60; // TODO: make configurable by app?
  });

  public appTitle = this.config.appTitle;

  private sidenavOpened = signal<boolean>(false);

  public sidenavMode = computed<'side' | 'over'>(() => {
    // 768 is tailwindcss 'md' screen size
    return this.getPageWidth()() > 768 ? 'side' : 'over'; // TODO: make configurable by app?
  });

  constructor() {
    fromEvent(window, 'resize')
      .pipe(takeUntilDestroyed(), debounceTime(300))
      .subscribe(() => {
        this.pageHeight.set(window.innerHeight);
        this.pageWidth.set(window.innerWidth);
      });
  }

  toggleSidenavIfModeOver(): void {
    if (this.sidenavMode() === 'over') {
      this.toggleSidenav(false);
    }
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
