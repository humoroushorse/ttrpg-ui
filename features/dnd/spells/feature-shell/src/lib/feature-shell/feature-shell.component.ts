import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'lib-feature-shell',
  imports: [RouterModule],
  templateUrl: './feature-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './feature-shell.component.scss',
  // passes the app's page height down, so a page can fill it
  host: { class: 'flex grow flex-col' },
})
export class FeatureShellComponent {}
