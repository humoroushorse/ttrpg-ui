import { ChangeDetectionStrategy, Component, ElementRef, inject, input, output, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';

@Component({
  selector: 'lib-game-session-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './game-session-card.component.html',
  styleUrl: './game-session-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameSessionCardComponent {
  readonly sharedCoreService = inject(SharedCoreService);

  viewGameSessionClicked = output<EventPlanningModels.Schemas.GameSessionSchema>();

  entity = input<EventPlanningModels.Schemas.GameSessionSchema>();

  mode = input<'gallery' | 'list'>('gallery');

  cardContentRef = viewChild<ElementRef<HTMLDivElement>>('cardContent');

  pageWidth = this.sharedCoreService.getPageWidth();
}
