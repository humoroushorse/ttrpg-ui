import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-util',
  imports: [],
  templateUrl: './util.component.html',
  styleUrl: './util.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UtilComponent {}
