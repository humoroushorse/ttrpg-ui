import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableTokens } from '@ttrpg-ui/shared/table/models';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'lib-temp-example',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './temp-example.component.html',
  styleUrl: './temp-example.component.scss',
})
export class TempExampleComponent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(@Inject(TableTokens.SHARED_TABLE_DATA) public data: any) {}
}
