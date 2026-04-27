import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SharedThemeService } from '@ttrpg-ui/shared/theme/data-access';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { SharedThemePickerComponent } from '@ttrpg-ui/shared/theme/ui';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { SharedSidenavRouterItemComponent, SharedSidenavRouterItem } from '@ttrpg-ui/shared/sidenav/ui';
import { NotificationCenterComponent, sprintManagementSidenavRoutes } from '@ttrpg-ui/features/sprint-management/ui';
import { userSidenavRoutes } from '@ttrpg-ui/features/user/ui';
import { KeyboardShortcutService } from '@ttrpg-ui/shared/keyboard-shortcut/data-access';

@Component({
  imports: [
    RouterModule,
    SharedThemePickerComponent,
    SharedSidenavRouterItemComponent,
    NotificationCenterComponent,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatMenuModule,
    MatTooltipModule,
    MatSidenavModule,
    MatListModule,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  protected title = 'sprint-management';

  public readonly sharedThemeService = inject(SharedThemeService);
  private readonly sharedCoreService = inject(SharedCoreService);
  private readonly authService = inject(AuthService);
  private readonly keyboardShortcutService = inject(KeyboardShortcutService);
  private readonly dialog = inject(MatDialog);

  public appTitle = this.sharedCoreService.appTitle;
  public toolbarHeight = this.sharedCoreService.getToolbarHeight();
  public sidenavOpened$ = this.sharedCoreService.getSidenavOpened();
  sidenavMode = this.sharedCoreService.sidenavMode;

  public toggleSidenav(opened?: boolean) {
    this.sharedCoreService.toggleSidenav(opened);
  }

  public userTokenDecoded = this.authService.getUserTokenDecoded();
  readonly loginRoute = this.authService.authGuardAuthAppLoginRoute;

  logout() {
    this.authService.postSessionLogout();
  }

  public toolbarHeight$ = this.sharedCoreService.getToolbarHeight();

  public sidnavHeight$ = computed<string>(() => {
    return `calc(100dvh - ${this.toolbarHeight$()}px)`;
  });

  filterRoutes(routes: SharedSidenavRouterItem[]): SharedSidenavRouterItem[] {
    return routes.reduce<SharedSidenavRouterItem[]>((acc, route) => {
      let filteredChildren: SharedSidenavRouterItem[] = [];
      if (route.children) {
        filteredChildren = this.filterRoutes(route.children);
      }
      if (!route.requiresLogin || filteredChildren.length > 0) {
        acc.push({
          ...route,
          children: filteredChildren || undefined,
        });
      }
      return acc;
    }, []);
  }

  readonly defaultRoutes: SharedSidenavRouterItem[] = [
    {
      viewValue: 'Sprint Management',
      children: sprintManagementSidenavRoutes,
    },
    {
      viewValue: 'User',
      children: userSidenavRoutes,
    },
  ];

  public routes = computed<SharedSidenavRouterItem[]>(() => {
    return this.userTokenDecoded() === null ? this.filterRoutes(this.defaultRoutes) : this.defaultRoutes;
  });

  ngOnInit(): void {
    // Register global keyboard shortcuts
    this.registerGlobalKeyboardShortcuts();
  }

  private registerGlobalKeyboardShortcuts(): void {
    // 'Esc' - Close dialogs
    this.keyboardShortcutService.register({
      id: 'global-close-dialog',
      key: 'Escape',
      description: 'Close dialogs and modals',
      context: 'Global',
      handler: () => {
        // Close the topmost dialog if any are open
        this.dialog.closeAll();
      },
    });
  }
}
