import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';

@Component({
  selector: 'lib-features-auth-feature-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './features-auth-feature-shell.component.html',
  styleUrl: './features-auth-feature-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturesAuthFeatureShellComponent {
  private coreService = inject(SharedCoreService);

  public toolbarHeight: Signal<number> = this.coreService.getToolbarHeight();
}
