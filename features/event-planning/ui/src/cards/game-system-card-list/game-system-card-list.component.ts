import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { GameSystemCardComponent } from '../game-system-card/game-system-card.component';
import { SharedNotificationComponent } from '@ttrpg-ui/shared/notification/ui';

@Component({
  selector: 'lib-game-system-card-list',
  imports: [CommonModule, GameSystemCardComponent, SharedNotificationComponent],
  templateUrl: './game-system-card-list.component.html',
  styleUrl: './game-system-card-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameSystemCardListComponent {
  viewClicked = output<EventPlanningModels.GameSystem.GameSystemSchema>();

  deleteClicked = output<EventPlanningModels.GameSystem.GameSystemSchema>();

  entities = input<EventPlanningModels.GameSystem.GameSystemSchema[]>();
}
