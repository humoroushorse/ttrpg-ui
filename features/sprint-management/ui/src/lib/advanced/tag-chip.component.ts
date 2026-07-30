import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'lib-tag-chip',
  standalone: true,
  imports: [MatChipsModule, MatIconModule],
  templateUrl: './tag-chip.component.html',
  styleUrl: './tag-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagChipComponent {
  tag = input.required<string>();
  removable = input<boolean>(true);
  styleClass = input<string>('');
  removed = output<string>();

  chipClass() {
    return this.styleClass();
  }
}
