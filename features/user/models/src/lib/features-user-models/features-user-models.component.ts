import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-features-user-models',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './features-user-models.component.html',
  styleUrl: './features-user-models.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturesUserModelsComponent {}
