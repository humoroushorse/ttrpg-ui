import { Component, inject, Signal, ChangeDetectionStrategy } from '@angular/core';

import { RouterModule } from '@angular/router';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';

@Component({
  selector: 'lib-features-auth-feature-shell',
  imports: [RouterModule],
  templateUrl: './features-auth-feature-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './features-auth-feature-shell.component.scss',
})
export class FeaturesAuthFeatureShellComponent {
  private readonly coreService = inject(SharedCoreService);

  public toolbarHeight: Signal<number> = this.coreService.getToolbarHeight();
}
