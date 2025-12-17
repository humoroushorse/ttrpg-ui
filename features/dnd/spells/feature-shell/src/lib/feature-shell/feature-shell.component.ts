import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'lib-feature-shell',
  imports: [RouterModule],
  templateUrl: './feature-shell.component.html',
  styleUrl: './feature-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureShellComponent {}
