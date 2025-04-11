import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';

@Component({
    selector: 'lib-page-auth-forgot-password',
    imports: [CommonModule, RouterModule],
    templateUrl: './page-auth-forgot-password.component.html',
    styleUrl: './page-auth-forgot-password.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAuthForgotPasswordComponent implements OnInit {
  readonly meta = inject(Meta);

  readonly title = inject(Title);

  readonly sharedCoreService = inject(SharedCoreService);

  readonly authService = inject(AuthService);

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
