import { Component, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';

@Component({
  selector: 'lib-features-user-feature-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './features-user-feature-shell.component.html',
  styleUrl: './features-user-feature-shell.component.scss',
})
export class FeaturesUserFeatureShellComponent {
  private coreService = inject(SharedCoreService);

  public toolbarHeight: Signal<number> = this.coreService.getToolbarHeight();
}
