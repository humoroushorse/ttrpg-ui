import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameSessionCardComponent } from '../game-session-card/game-session-card.component';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';

@Component({
  selector: 'lib-game-session-card-list',
  standalone: true,
  imports: [CommonModule, GameSessionCardComponent],
  templateUrl: './game-session-card-list.component.html',
  styleUrl: './game-session-card-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameSessionCardListComponent {
  viewGameSessionClicked = output<EventPlanningModels.Schemas.GameSessionSchema>();

  entities = input<EventPlanningModels.Schemas.GameSessionSchema[]>();

  mode = input<'gallery' | 'list'>('gallery');
}