import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { SprintStatus } = SprintModels.Sprint;
type Sprint = SprintModels.Sprint.Sprint;
type SprintWithMetrics = SprintModels.Sprint.SprintWithMetrics;
type SprintStatus = SprintModels.Sprint.SprintStatus;

/**
 * Sprint Card Component
 *
 * Displays a sprint summary in card format with dates, progress bar, and status badge.
 * Emits click events for interaction.
 *
 */
@Component({
  selector: 'lib-sprint-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressBarModule,
  ],
  templateUrl: './sprint-card.component.html',
  styleUrl: './sprint-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SprintCardComponent {
  sprint = input.required<Sprint | SprintWithMetrics>();

  cardClicked = output<Sprint | SprintWithMetrics>();
  viewClicked = output<Sprint | SprintWithMetrics>();
  editClicked = output<Sprint | SprintWithMetrics>();

  hasMetrics = computed(() => {
    const s = this.sprint();
    return 'total_items' in s;
  });

  metrics = computed(() => {
    const s = this.sprint();
    if ('total_items' in s) {
      return s as SprintWithMetrics;
    }
    return null;
  });

  progressPercentage = computed(() => {
    const m = this.metrics();
    if (!m || m.total_items === 0) {
      return 0;
    }
    return Math.round((m.completed_items / m.total_items) * 100);
  });

  onCardClick(): void {
    this.cardClicked.emit(this.sprint());
  }

  onViewClick(event: Event): void {
    event.stopPropagation();
    this.viewClicked.emit(this.sprint());
  }

  onEditClick(event: Event): void {
    event.stopPropagation();
    this.editClicked.emit(this.sprint());
  }

  getStatusColor(): string {
    const sprint = this.sprint();
    switch (sprint.status) {
      case SprintStatus.Active:
        return 'status-active';
      case SprintStatus.Completed:
        return 'status-completed';
      case SprintStatus.Planning:
        return 'status-planning';
      case SprintStatus.Cancelled:
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  }

  getStatusIcon(): string {
    const sprint = this.sprint();
    switch (sprint.status) {
      case SprintStatus.Active:
        return 'play_circle';
      case SprintStatus.Completed:
        return 'check_circle';
      case SprintStatus.Planning:
        return 'schedule';
      case SprintStatus.Cancelled:
        return 'cancel';
      default:
        return 'help';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  getProgressColor(): string {
    const percentage = this.progressPercentage();
    if (percentage >= 75) {
      return 'primary';
    } else if (percentage >= 50) {
      return 'accent';
    } else {
      return 'warn';
    }
  }
}
