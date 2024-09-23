import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-shared-page-not-found',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shared-page-not-found.component.html',
  styleUrl: './shared-page-not-found.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SharedPageNotFoundComponent {}
