import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { EventPlanningGameSystemStore } from '@ttrpg-ui/features/event-planning/data-access';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';

@Component({
  selector: 'lib-event-planning-game-system-table-actions',
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './event-planning-game-system-table-actions.component.html',
  styleUrl: './event-planning-game-system-table-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventPlanningGameSystemTableActionsComponent {
  readonly authService = inject(AuthService);

  readonly dataStore = inject(EventPlanningGameSystemStore);

  readonly data = input<EventPlanningModels.GameSystem.GameSystemSchema>();

  onDeleteClicked(data: EventPlanningModels.GameSystem.GameSystemSchema) {
    this.dataStore.delete(data);
  }
}
