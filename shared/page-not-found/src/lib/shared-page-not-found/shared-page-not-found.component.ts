import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'lib-shared-page-not-found',
  imports: [CommonModule, RouterModule],
  templateUrl: './shared-page-not-found.component.html',
  styleUrl: './shared-page-not-found.component.scss',
})
export class SharedPageNotFoundComponent {
  private readonly authService = inject(AuthService);

  public readonly loginRoute = this.authService.authGuardAuthAppLoginRoute;

  public readonly homeRoute = this.authService.alreadyLoggedInGuardRedirectRoute;
}
