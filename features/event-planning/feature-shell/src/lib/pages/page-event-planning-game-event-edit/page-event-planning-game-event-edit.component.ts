import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-page-event-planning-game-event-edit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-event-planning-game-event-edit.component.html',
  styleUrl: './page-event-planning-game-event-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageEventPlanningGameEventEditComponent {}
