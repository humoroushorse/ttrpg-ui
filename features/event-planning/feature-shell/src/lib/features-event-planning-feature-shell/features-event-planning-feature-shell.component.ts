import { Component, ChangeDetectionStrategy } from '@angular/core';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'lib-features-event-planning-feature-shell',
  imports: [RouterModule],
  templateUrl: './features-event-planning-feature-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './features-event-planning-feature-shell.component.scss',
})
export class FeaturesEventPlanningFeatureShellComponent {}
