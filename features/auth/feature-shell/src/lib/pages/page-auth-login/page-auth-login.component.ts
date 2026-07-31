import { Component, inject, OnInit } from '@angular/core';

import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { Meta, Title } from '@angular/platform-browser';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';

@Component({
  selector: 'lib-page-auth-login',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './page-auth-login.component.html',
  styleUrl: './page-auth-login.component.scss',
})
export class PageAuthLoginComponent implements OnInit {
  private readonly meta = inject(Meta);

  private readonly title = inject(Title);

  private readonly sharedCoreService = inject(SharedCoreService);

  public readonly authService = inject(AuthService);

  public p = this.authService.authGuardAuthAppLoginRoute();

  public hidePassword = true;

  public loginForm = new FormGroup({
    username: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    password: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
  });

  ngOnInit(): void {
    this.title.setTitle(`Login to Your Account | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({
      name: 'description',
      content: `Access your ${this.sharedCoreService.appTitle} account to manage your settings, view content, and more. Enter your username and password to log in.`,
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const value = this.loginForm.value;
      this.authService.postSessionLogin(value.username as string, value.password as string);
    }
  }
}
