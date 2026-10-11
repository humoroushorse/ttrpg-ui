import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'lib-feature-shell',
  imports: [RouterModule],
  templateUrl: './feature-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './feature-shell.component.scss',
})
export class FeatureShellComponent {}
