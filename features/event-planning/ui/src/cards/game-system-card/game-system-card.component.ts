import { Component, inject, input, output } from '@angular/core';

import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';

@Component({
  selector: 'lib-game-system-card',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './game-system-card.component.html',
  styleUrl: './game-system-card.component.scss',
})
export class GameSystemCardComponent {
  private readonly sharedCoreService = inject(SharedCoreService);

  private readonly authService = inject(AuthService);

  viewClicked = output<EventPlanningModels.GameSystem.GameSystemSchema>();

  deleteClicked = output<EventPlanningModels.GameSystem.GameSystemSchema>();

  entity = input<EventPlanningModels.GameSystem.GameSystemSchema>();

  hideViewButton = input(false);

  // cardContentRef = viewChild<ElementRef<HTMLDivElement>>('cardContent');

  pageWidth = this.sharedCoreService.getPageWidth();
}
