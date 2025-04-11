import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'lib-page-event-planning-not-found',
  imports: [CommonModule, RouterModule],
  templateUrl: './page-event-planning-not-found.component.html',
  styleUrl: './page-event-planning-not-found.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageEventPlanningNotFoundComponent {}
