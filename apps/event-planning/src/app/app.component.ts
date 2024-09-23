import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedThemeService } from '@ttrpg-ui/shared/theme/data-access';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { SharedThemePickerComponent } from '@ttrpg-ui/shared/theme/ui';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    SharedThemePickerComponent,

    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'event-planning';

  public sharedThemeService = inject(SharedThemeService);

  private sharedCoreService = inject(SharedCoreService);

  public appTitle = this.sharedCoreService.appTitle;

  public sidenavOpened$ = this.sharedCoreService.getSidenavOpened();

  public toggleSidenav(opened?: boolean) {
    this.sharedCoreService.toggleSidenav(opened);
  }
}
