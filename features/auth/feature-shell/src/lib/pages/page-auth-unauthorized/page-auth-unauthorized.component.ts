import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';

@Component({
    selector: 'lib-page-auth-unauthorized',
    imports: [CommonModule, RouterModule],
    templateUrl: './page-auth-unauthorized.component.html',
    styleUrl: './page-auth-unauthorized.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAuthUnauthorizedComponent implements OnInit {
  readonly meta = inject(Meta);

  readonly title = inject(Title);

  readonly authService = inject(AuthService);

  readonly loginRoute = this.authService.authGuardAuthAppLoginRoute;

  readonly sharedCoreService = inject(SharedCoreService);

  public unauthorizedRoute: string | null = null;

  ngOnInit(): void {
    this.title.setTitle(`Unauthorized Access | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({
      name: 'description',
      content: `You do not have permission to access this page on ${this.sharedCoreService.appTitle}. Please log in with appropriate credentials or contact support.`,
    });
  }
}
