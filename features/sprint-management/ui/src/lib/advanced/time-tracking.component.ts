import { Component, computed, effect, inject, input, output, signal } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';
import { TimeTrackingStore } from '@ttrpg-ui/features/sprint-management/data-access';
import { TimeEntryFormComponent } from '../time-tracking/time-entry-form.component';
import { TimeEntryListComponent } from '../time-tracking/time-entry-list.component';

type TimeTrackingSummary = SprintModels.TimeTracking.TimeTrackingSummary;
type TimeEntryWithUser = SprintModels.TimeTracking.TimeEntryWithUser;
type TimeEntry = SprintModels.TimeTracking.TimeEntry;
type CreateTimeEntryRequest = SprintModels.TimeTracking.CreateTimeEntryRequest;
type UpdateTimeEntryRequest = SprintModels.TimeTracking.UpdateTimeEntryRequest;

/**
 * Time Tracking Component
 *
 * Displays time tracking summary with estimated, logged, and remaining hours.
 * Lists time entries and provides form to log new time.
 */
@Component({
  selector: 'lib-time-tracking',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDividerModule,
    TimeEntryFormComponent,
    TimeEntryListComponent,
  ],
  templateUrl: './time-tracking.component.html',
  styleUrl: './time-tracking.component.scss',
})
export class TimeTrackingComponent {
  private readonly timeTrackingStore = inject(TimeTrackingStore);

  workItemId = input<string>('');
  estimatedHours = input<number | null>(null);
  summary = input<TimeTrackingSummary | null>(null);
  disabled = input<boolean>(false);

  logTime = output<void>();
  editEntry = output<TimeEntry>();
  deleteEntry = output<TimeEntry>();

  showForm = signal(false);
  editingEntry = signal<TimeEntry | null>(null);

  storeSummary = this.timeTrackingStore.timeTrackingSummary;
  storeLoading = this.timeTrackingStore.loading;
  storeEntries = this.timeTrackingStore.entities;

  activeSummary = computed(() => {
    return this.storeSummary() ?? this.summary();
  });

  remainingHours = computed(() => {
    const s = this.activeSummary();
    if (!s || s.estimated_hours === null) {
      return null;
    }
    return s.estimated_hours - s.logged_hours;
  });

  progressPercentage = computed(() => {
    const s = this.activeSummary();
    if (!s || !s.estimated_hours) {
      return 0;
    }
    return Math.min(Math.round((s.logged_hours / s.estimated_hours) * 100), 100);
  });

  progressColor = computed(() => {
    const percentage = this.progressPercentage();
    if (percentage >= 100) {
      return 'warn';
    } else if (percentage >= 75) {
      return 'accent';
    }
    return 'primary';
  });

  constructor() {
    effect(() => {
      const id = this.workItemId();
      const est = this.estimatedHours();
      if (id) {
        this.timeTrackingStore.loadTimeEntries({ workItemId: id, estimatedHours: est });
      }
    });
  }

  onLogTimeClick(): void {
    this.showForm.set(true);
    this.editingEntry.set(null);
    this.logTime.emit();
  }

  onFormSubmitted(request: CreateTimeEntryRequest | UpdateTimeEntryRequest): void {
    const id = this.workItemId();
    if (!id) return;

    if ('work_item_id' in request) {
      this.timeTrackingStore.addTimeEntry(request as CreateTimeEntryRequest);
    } else {
      this.timeTrackingStore.updateTimeEntry({
        workItemId: id,
        request: request as UpdateTimeEntryRequest,
      });
    }

    this.showForm.set(false);
    this.editingEntry.set(null);
  }

  onFormCancelled(): void {
    this.showForm.set(false);
    this.editingEntry.set(null);
  }

  onEditEntry(entry: TimeEntry): void {
    this.editingEntry.set(entry);
    this.showForm.set(true);
    this.editEntry.emit(entry);
  }

  onDeleteEntry(entry: TimeEntry): void {
    const id = this.workItemId();
    if (!id) return;

    this.timeTrackingStore.deleteTimeEntry({ workItemId: id, entryId: entry.id });
    this.deleteEntry.emit(entry);
  }

  formatHours(hours: number | null | undefined): string {
    if (hours === null || hours === undefined) {
      return '--';
    }
    return `${hours}h`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  getUserName(entry: TimeEntryWithUser): string {
    if (entry.user) {
      return `${entry.user.first_name} ${entry.user.last_name}`.trim() || entry.user.username;
    }
    return 'Unknown User';
  }
}
