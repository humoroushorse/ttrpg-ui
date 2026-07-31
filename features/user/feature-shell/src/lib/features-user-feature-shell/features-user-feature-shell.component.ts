import { Component, inject, Signal, ChangeDetectionStrategy } from '@angular/core';

import { RouterModule } from '@angular/router';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';

@Component({
  selector: 'lib-features-user-feature-shell',
  imports: [RouterModule],
  templateUrl: './features-user-feature-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './features-user-feature-shell.component.scss',
})
export class FeaturesUserFeatureShellComponent {
  readonly sharedCoreService = inject(SharedCoreService);

  public toolbarHeight: Signal<number> = this.sharedCoreService.getToolbarHeight();
}
