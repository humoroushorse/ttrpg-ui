import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameSessionCardComponent } from '../game-session-card/game-session-card.component';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { SharedNotificationComponent } from '@ttrpg-ui/shared/notification/ui';

@Component({
  selector: 'lib-game-session-card-list',
  imports: [CommonModule, GameSessionCardComponent, SharedNotificationComponent],
  templateUrl: './game-session-card-list.component.html',
  styleUrl: './game-session-card-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameSessionCardListComponent {
  viewGameSessionClicked = output<EventPlanningModels.GameSession.GameSessionSchema>();

  joinGameSessionClicked = output<EventPlanningModels.GameSession.GameSessionSchema>();

  leaveGameSessionClicked = output<EventPlanningModels.GameSession.GameSessionSchema>();

  entities = input<EventPlanningModels.GameSession.GameSessionSchema[]>();

  mode = input<'gallery' | 'list'>('gallery');
}
