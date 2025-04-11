import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SharedFormValidators } from '@ttrpg-ui/shared/forms/util';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { RegisterUserInput } from 'features/auth/models/src/lib/models/models';
@Component({
    selector: 'lib-page-auth-register',
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        MatTooltipModule,
        MatCardModule,
        MatIconModule,
    ],
    templateUrl: './page-auth-register.component.html',
    styleUrl: './page-auth-register.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAuthRegisterComponent implements OnInit {
  readonly meta = inject(Meta);

  readonly title = inject(Title);

  readonly sharedCoreService = inject(SharedCoreService);

  readonly authService = inject(AuthService);

  readonly loginRoute = this.authService.authGuardAuthAppLoginRoute;

  hidePassword = true;

  hidePasswordVerify = true;

  public registerForm = new FormGroup(
    {
      email: new FormControl<string>('', { validators: [Validators.required, Validators.email], nonNullable: true }),
      userName: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
      password: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
      passwordVerify: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
      firstName: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
      lastName: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    },
    { validators: [SharedFormValidators.matchValidator('password', 'passwordVerify')] },
  );

  ngOnInit(): void {
    this.title.setTitle(`Create a New Account | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({
      name: 'description',
      content: `Join ${this.sharedCoreService.appTitle} today! Create a new account to get access to all features. Sign up quickly with your email and a secure password.`,
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const value = this.registerForm.value as RegisterUserInput;
      this.authService.postUser(value);
    }
  }
}
