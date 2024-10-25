import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-page-event-planning-game-system-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-event-planning-game-system-view.component.html',
  styleUrl: './page-event-planning-game-system-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageEventPlanningGameSystemViewComponent {}
