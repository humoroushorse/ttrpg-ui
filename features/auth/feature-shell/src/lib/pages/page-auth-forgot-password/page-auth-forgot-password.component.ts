import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';

@Component({
  selector: 'lib-page-auth-forgot-password',
  imports: [RouterModule],
  templateUrl: './page-auth-forgot-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './page-auth-forgot-password.component.scss',
})
export class PageAuthForgotPasswordComponent implements OnInit {
  private readonly meta = inject(Meta);

  private readonly title = inject(Title);

  private readonly sharedCoreService = inject(SharedCoreService);

  private readonly authService = inject(AuthService);

  readonly loginRoute = this.authService.authGuardAuthAppLoginRoute;

  public unauthorizedRoute: string | null = null;

  ngOnInit(): void {
    this.title.setTitle(`Forgot Your Password? | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({
      name: 'description',
      content: `Recover your ${this.sharedCoreService.appTitle} account password by entering your email. We'll send instructions to reset your password.`,
    });
  }
}
