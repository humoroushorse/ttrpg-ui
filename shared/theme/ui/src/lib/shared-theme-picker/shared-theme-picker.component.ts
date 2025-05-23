import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedThemeService } from '@ttrpg-ui/shared/theme/data-access';
import { AppTheme } from '@ttrpg-ui/shared/theme/models';

@Component({
  selector: 'lib-shared-theme-picker',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatRadioModule, MatTooltipModule],
  templateUrl: './shared-theme-picker.component.html',
  styleUrl: './shared-theme-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedThemePickerComponent {
  readonly sharedThemeService = inject(SharedThemeService);

  selectedTheme$ = this.sharedThemeService.getActiveTheme();

  themes$ = this.sharedThemeService.getThemes();

  public isMenuItem = input();

  setTheme(theme: AppTheme) {
    this.sharedThemeService.setTheme(theme);
  }
}
