import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { EventPlanningGameSessionStore } from '@ttrpg-ui/features/event-planning/data-access';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'lib-event-planning-game-session-table-actions',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
  templateUrl: './event-planning-game-session-table-actions.component.html',
  styleUrl: './event-planning-game-session-table-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventPlanningGameSessionTableActionsComponent {
  readonly authService = inject(AuthService);

  readonly dataStore = inject(EventPlanningGameSessionStore);

  readonly data = input<EventPlanningModels.GameSession.GameSessionSchema>();

  onDeleteClicked(data: EventPlanningModels.GameSession.GameSessionSchema) {
    this.dataStore.delete(data);
  }

  onJoinClicked(data: EventPlanningModels.GameSession.GameSessionSchema) {
    this.dataStore.joinSession(data);
  }

  onLeaveClicked(data: EventPlanningModels.GameSession.GameSessionSchema) {
    this.dataStore.leaveSession(data);
  }
}
