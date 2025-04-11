import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'lib-features-event-planning-feature-shell',
  imports: [CommonModule, RouterModule],
  templateUrl: './features-event-planning-feature-shell.component.html',
  styleUrl: './features-event-planning-feature-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturesEventPlanningFeatureShellComponent {}
