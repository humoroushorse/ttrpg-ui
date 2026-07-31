import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { GameSystemCardComponent } from '../game-system-card/game-system-card.component';
import { SharedNotificationComponent } from '@ttrpg-ui/shared/notification/ui';

@Component({
  selector: 'lib-game-system-card-list',
  imports: [GameSystemCardComponent, SharedNotificationComponent],
  templateUrl: './game-system-card-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './game-system-card-list.component.scss',
})
export class GameSystemCardListComponent {
  viewClicked = output<EventPlanningModels.GameSystem.GameSystemSchema>();

  deleteClicked = output<EventPlanningModels.GameSystem.GameSystemSchema>();

  entities = input<EventPlanningModels.GameSystem.GameSystemSchema[]>();
}
