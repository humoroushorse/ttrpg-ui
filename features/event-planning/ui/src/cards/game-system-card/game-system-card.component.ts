import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { UserAvatarListComponent } from '@ttrpg-ui/features-user-ui';

@Component({
  selector: 'lib-game-system-card',
  standalone: true,
  imports: [CommonModule, UserAvatarListComponent, MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './game-system-card.component.html',
  styleUrl: './game-system-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameSystemCardComponent {
  readonly sharedCoreService = inject(SharedCoreService);

  readonly authService = inject(AuthService);

  viewClicked = output<EventPlanningModels.GameSystem.GameSystemSchema>();

  deleteClicked = output<EventPlanningModels.GameSystem.GameSystemSchema>();

  entity = input<EventPlanningModels.GameSystem.GameSystemSchema>();

  hideViewButton = input(false);

  // cardContentRef = viewChild<ElementRef<HTMLDivElement>>('cardContent');

  pageWidth = this.sharedCoreService.getPageWidth();
}
