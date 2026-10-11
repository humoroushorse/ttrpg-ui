import { Component, ChangeDetectionStrategy } from '@angular/core';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'lib-page-event-planning-not-found',
  imports: [RouterModule],
  templateUrl: './page-event-planning-not-found.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './page-event-planning-not-found.component.scss',
})
export class PageEventPlanningNotFoundComponent {}
