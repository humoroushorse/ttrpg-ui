import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedThemePickerComponent } from '@ttrpg-ui/shared/theme/ui';
import { Meta, Title } from '@angular/platform-browser';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserAvatarComponent } from '@ttrpg-ui/features-user-ui';
import { EventPlanningApiService } from '@ttrpg-ui/features/event-planning/data-access';
import { BehaviorSubject, switchMap, take } from 'rxjs';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'lib-page-user-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    SharedThemePickerComponent,
    UserAvatarComponent,

    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './page-user-settings.component.html',
  styleUrl: './page-user-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageUserSettingsComponent implements OnInit {
  readonly authService = inject(AuthService);

  readonly meta = inject(Meta);

  readonly title = inject(Title);

  readonly sharedCoreService = inject(SharedCoreService);

  readonly eventPlanningApiService = inject(EventPlanningApiService)

  userTokenDecoded = this.authService.getUserTokenDecoded();

  userTokenTimeRemaining$ = this.authService.userTokenTimeRemaining$;

  refreshTokenAtSecondsRemaining = this.authService.refreshTokenAtSecondsRemaining;

  currentUserTrigger$ = new BehaviorSubject(false);

  currentUser$ = this.currentUserTrigger$.pipe(
    switchMap(() => this.eventPlanningApiService.getCurrentUser()),
  )

  userForm = new FormGroup({
    profile_picture_url: new FormControl<string | null>(null),
  })

  public onSubmit() {
    if (!this.userForm.valid) return;
    this.eventPlanningApiService.updateCurrentUser({
      profile_picture_url: this.userForm.controls.profile_picture_url.value || undefined
    }).pipe(take(1)).subscribe({
      next: () => {
        this.currentUserTrigger$.next(true);
        this.userForm.reset();
      }
    })
  }

  ngOnInit(): void {
    this.title.setTitle(`User Settings | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({
      name: 'description',
      content: `Edit your personalized settings for ${this.sharedCoreService.appTitle}.`,
    });
  }

  deleteAccount() {
    // ik-todo: confirmation prompt
    this.authService.deleteUser();
  }
}
