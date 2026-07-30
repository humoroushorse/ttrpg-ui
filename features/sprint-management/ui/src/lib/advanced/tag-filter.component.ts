import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';

export interface TagWithCount {
  tag: string;
  count: number;
}

@Component({
  selector: 'lib-tag-filter',
  standalone: true,
  imports: [MatChipsModule, MatIconModule, MatBadgeModule, MatButtonModule],
  templateUrl: './tag-filter.component.html',
  styleUrl: './tag-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagFilterComponent {
  availableTags = input<TagWithCount[]>([]);
  selectedTags = input<string[]>([]);

  selectionChanged = output<string[]>();

  isSelected(tag: string): boolean {
    return this.selectedTags().includes(tag);
  }

  toggleTag(tag: string): void {
    const current = this.selectedTags();
    const updated = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag];
    this.selectionChanged.emit(updated);
  }

  clearAll(): void {
    this.selectionChanged.emit([]);
  }
}
