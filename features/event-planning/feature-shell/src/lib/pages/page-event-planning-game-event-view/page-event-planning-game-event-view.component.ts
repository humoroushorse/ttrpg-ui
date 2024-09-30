import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-page-event-planning-game-event-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-event-planning-game-event-view.component.html',
  styleUrl: './page-event-planning-game-event-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageEventPlanningGameEventViewComponent {}
