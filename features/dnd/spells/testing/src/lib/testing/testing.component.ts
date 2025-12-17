import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-testing',
  imports: [],
  templateUrl: './testing.component.html',
  styleUrl: './testing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestingComponent {}
