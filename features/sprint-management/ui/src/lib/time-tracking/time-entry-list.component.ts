import { Component, computed, input, output } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

type TimeEntry = SprintModels.TimeTracking.TimeEntry;

@Component({
  selector: 'lib-time-entry-list',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './time-entry-list.component.html',
  styleUrl: './time-entry-list.component.scss',
})
export class TimeEntryListComponent {
  entries = input.required<TimeEntry[]>();
  loading = input<boolean>(false);
  currentUserId = input<string>('');

  editEntry = output<TimeEntry>();
  deleteEntry = output<TimeEntry>();

  sortedEntries = computed(() => {
    const items = this.entries();
    return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  onEditClick(entry: TimeEntry): void {
    this.editEntry.emit(entry);
  }

  onDeleteClick(entry: TimeEntry): void {
    this.deleteEntry.emit(entry);
  }

  canModify(entry: TimeEntry): boolean {
    const userId = this.currentUserId();
    return !userId || entry.user_id === userId;
  }

  formatDate(dateString: string): string {
    // Parse date-only strings as local date to avoid timezone offset issues
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
