import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';

export interface SharedSidenavRouterItem {
  viewValue: string;
  path?: string[];
  icon?: string;
  children?: SharedSidenavRouterItem[];
}

@Component({
  selector: 'lib-shared-sidenav-router-item',
  standalone: true,
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
})
export class SharedSidenavRouterItemComponent {
  readonly router = inject(Router);

  public routerItem = input<SharedSidenavRouterItem>();

  public showChildren = false;

  isChildActive(routerLinks: SharedSidenavRouterItem[]): boolean {
    return routerLinks?.some((child) => {
      if (child.path && this.router.url.includes(child.path?.join('/') || '')) return true;
      return child.children ? this.isChildActive(child.children) : false;
    });
  }
}
