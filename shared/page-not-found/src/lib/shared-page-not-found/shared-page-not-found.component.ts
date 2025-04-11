import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'lib-shared-page-not-found',
  imports: [CommonModule, RouterModule],
  templateUrl: './shared-page-not-found.component.html',
  styleUrl: './shared-page-not-found.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedPageNotFoundComponent {
  readonly authService = inject(AuthService);

  readonly loginRoute = this.authService.authGuardAuthAppLoginRoute;

  readonly homeRoute = this.authService.alreadyLoggedInGuardRedirectRoute;
}
