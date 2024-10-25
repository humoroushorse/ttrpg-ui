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

  private sharedCoreService = inject(SharedCoreService);

  private authService = inject(AuthService);

  public appTitle = this.sharedCoreService.appTitle;

  public toolbarHeight = this.sharedCoreService.getToolbarHeight();

  public sidenavOpened$ = this.sharedCoreService.getSidenavOpened();

  sidenavMode = computed<'side' | 'over'>(() => {
    return this.sharedCoreService.getPageWidth()() > 600 ? 'side' : 'over';
  });

  public toggleSidenav(opened?: boolean) {
    this.sharedCoreService.toggleSidenav(opened);
  }

  public userTokenDecoded = this.authService.getUserTokenDecoded();

  logout() {
    this.authService.postSessionLogout();
  }

  public toolbarHeight$$ = this.sharedCoreService.getToolbarHeight();

  public sidnavHeight$$ = computed<string>(() => {
    return `calc(100dvh - ${this.toolbarHeight$$()}px)`;
  });

  public routes: SharedSidenavRouterItem[] = [
    {
      viewValue: 'Event Planning',
      children: [
        { viewValue: 'Create Game Event', path: ['event-planning', 'game-event', 'create'] },
        { viewValue: 'View Game Events', path: ['event-planning', 'game-event'] },
        { viewValue: 'Create Game System', path: ['event-planning', 'game-system', 'create'] },
        { viewValue: 'View Game Systems', path: ['event-planning', 'game-system'] },
      ],
    },
    {
      viewValue: 'User',
      children: [{ viewValue: 'User Settings', path: ['user', 'settings'] }],
    },
  ];
}
