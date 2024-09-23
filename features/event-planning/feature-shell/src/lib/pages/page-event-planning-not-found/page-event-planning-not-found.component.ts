import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-page-event-planning-not-found',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-event-planning-not-found.component.html',
  styleUrl: './page-event-planning-not-found.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageEventPlanningNotFoundComponent {}
