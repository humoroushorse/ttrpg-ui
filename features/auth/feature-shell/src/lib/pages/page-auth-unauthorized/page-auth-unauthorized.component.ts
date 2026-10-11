import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';

@Component({
  selector: 'lib-page-auth-unauthorized',
  imports: [RouterModule],
  templateUrl: './page-auth-unauthorized.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './page-auth-unauthorized.component.scss',
})
export class PageAuthUnauthorizedComponent implements OnInit {
  private readonly meta = inject(Meta);

  private readonly title = inject(Title);

  private readonly authService = inject(AuthService);

  public readonly loginRoute = this.authService.authGuardAuthAppLoginRoute;

  private readonly sharedCoreService = inject(SharedCoreService);

  public unauthorizedRoute: string | null = null;

  ngOnInit(): void {
    this.title.setTitle(`Unauthorized Access | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({
      name: 'description',
      content: `You do not have permission to access this page on ${this.sharedCoreService.appTitle}. Please log in with appropriate credentials or contact support.`,
    });
  }
}
