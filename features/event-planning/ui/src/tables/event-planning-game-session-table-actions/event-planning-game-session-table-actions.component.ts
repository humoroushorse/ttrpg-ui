import { Component, computed, inject, input } from '@angular/core';

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
  imports: [RouterModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
  templateUrl: './event-planning-game-session-table-actions.component.html',
  styleUrl: './event-planning-game-session-table-actions.component.scss',
})
export class EventPlanningGameSessionTableActionsComponent {
  public readonly authService = inject(AuthService);

  private readonly dataStore = inject(EventPlanningGameSessionStore);

  public readonly data = input<EventPlanningModels.GameSession.GameSessionSchema>();

  isUserInEvent = computed(() => {
    const eventUsers = this.data()?.jt_user_game_session || [];
    return !!eventUsers.find((e) => e.user?.id === this.authService.getUserTokenDecoded()()?.sub);
  });

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
