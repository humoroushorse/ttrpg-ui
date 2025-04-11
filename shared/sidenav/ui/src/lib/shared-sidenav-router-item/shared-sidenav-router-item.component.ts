import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';

export interface SharedSidenavRouterItem {
  viewValue: string;
  path?: string[];
  icon?: string;
  children?: SharedSidenavRouterItem[];
  requiresLogin?: boolean;
}

@Component({
  selector: 'lib-shared-sidenav-router-item',
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatListModule,
    MatExpansionModule,
  ],
  templateUrl: './shared-sidenav-router-item.component.html',
  styleUrl: './shared-sidenav-router-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedSidenavRouterItemComponent {
  readonly router = inject(Router);

  readonly authService = inject(AuthService);

  readonly sharedCoreService = inject(SharedCoreService);

  isLoggedIn = computed(() => !!this.authService.getUserTokenDecoded()());

  public routerItem = input<SharedSidenavRouterItem>();

  public showChildren = false;

  isChildActive(routerLinks: SharedSidenavRouterItem[]): boolean {
    return routerLinks?.some((child) => {
      if (child.path && this.router.url.includes(child.path?.join('/') || '')) return true;
      return child.children ? this.isChildActive(child.children) : false;
    });
  }

  toggleSidenavIfModeOver() {
    this.sharedCoreService.toggleSidenavIfModeOver();
  }
}
