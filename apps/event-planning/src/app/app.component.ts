import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
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
@Component({
  standalone: true,
  imports: [
    RouterModule,
    SharedThemePickerComponent,
    SharedSidenavRouterItemComponent,

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
export class AppComponent {
  public sharedThemeService = inject(SharedThemeService);

  readonly sharedCoreService = inject(SharedCoreService);

  readonly authService = inject(AuthService);

  public appTitle = this.sharedCoreService.appTitle;

  public toolbarHeight = this.sharedCoreService.getToolbarHeight();

  public sidenavOpened$ = this.sharedCoreService.getSidenavOpened();

  sidenavMode = computed<'side' | 'over'>(() => {
    // 768 is tailwindcss 'md' screen size
    return this.sharedCoreService.getPageWidth()() > 768 ? 'side' : 'over';
  });

  public toggleSidenav(opened?: boolean) {
    this.sharedCoreService.toggleSidenav(opened);
  }

  public userTokenDecoded = this.authService.getUserTokenDecoded();

  readonly loginRoute = this.authService.authGuardAuthAppLoginRoute;

  logout() {
    this.authService.postSessionLogout();
  }

  public toolbarHeight$$ = this.sharedCoreService.getToolbarHeight();

  public sidnavHeight$$ = computed<string>(() => {
    return `calc(100dvh - ${this.toolbarHeight$$()}px)`;
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

  readonly defaultRoutes = [
    {
      viewValue: 'Event Planning',
      children: [
        {
          viewValue: 'Create Game Event',
          path: ['event-planning', 'game-session', 'create'],
          icon: 'add',
          requiresLogin: true,
        },
        { viewValue: 'View Game Events', path: ['event-planning', 'game-session'] },
        {
          viewValue: 'Create Game System',
          path: ['event-planning', 'game-system', 'create'],
          icon: 'add',
          requiresLogin: true,
        },
        { viewValue: 'View Game Systems', path: ['event-planning', 'game-system'] },
      ],
    },
    {
      viewValue: 'User',
      children: [{ viewValue: 'User Settings', path: ['user', 'settings'], requiresLogin: true }],
    },
  ];

  public routes = computed<SharedSidenavRouterItem[]>(() => {
    return this.userTokenDecoded() === null ? this.filterRoutes(this.defaultRoutes) : this.defaultRoutes;
  });
}
