import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SharedThemePickerComponent } from '@ttrpg-ui/shared/theme/ui';
import { Meta, Title } from '@angular/platform-browser';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'lib-page-user-settings',
  standalone: true,
  imports: [CommonModule, SharedThemePickerComponent, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './page-user-settings.component.html',
  styleUrl: './page-user-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageUserSettingsComponent implements OnInit {
  readonly authService = inject(AuthService);

  readonly meta = inject(Meta);

  readonly title = inject(Title);

  readonly sharedCoreService = inject(SharedCoreService);

  userTokenDecoded = this.authService.getUserTokenDecoded();

  userTokenTimeRemaining$ = this.authService.userTokenTimeRemaining$;

  refreshTokenAtSecondsRemaining = this.authService.refreshTokenAtSecondsRemaining;

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
