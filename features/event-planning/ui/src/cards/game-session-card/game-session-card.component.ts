import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { UserAvatarComponent, UserAvatarListComponent } from '@ttrpg-ui/features-user-ui';

@Component({
  selector: 'lib-game-session-card',
  standalone: true,
  imports: [CommonModule, UserAvatarComponent, UserAvatarListComponent, MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './game-session-card.component.html',
  styleUrl: './game-session-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameSessionCardComponent {
  readonly sharedCoreService = inject(SharedCoreService);

  readonly authService = inject(AuthService);

  viewGameSessionClicked = output<EventPlanningModels.GameSession.GameSessionSchema>();

  joinGameSessionClicked = output<EventPlanningModels.GameSession.GameSessionSchema>();

  leaveGameSessionClicked = output<EventPlanningModels.GameSession.GameSessionSchema>();

  entity = input<EventPlanningModels.GameSession.GameSessionSchema>();

  hideViewButton = input(false);

  players = computed(() => {
    const players: EventPlanningModels.Schemas.UserSchema[] = [];
    this.entity()?.jt_user_game_session?.forEach((e) => {
      if (e.user) {
        players.push(e.user);
      }
    });
    return players;
  });

  isUserInEvent = computed(() => {
    const eventUsers = this.entity()?.jt_user_game_session || [];
    return !!eventUsers.find((e) => e.user?.id === this.authService.getUserTokenDecoded()()?.sub);
  });

  mode = input<'gallery' | 'list'>('gallery');

  cardContentRef = viewChild<ElementRef<HTMLDivElement>>('cardContent');

  pageWidth = this.sharedCoreService.getPageWidth();
}
