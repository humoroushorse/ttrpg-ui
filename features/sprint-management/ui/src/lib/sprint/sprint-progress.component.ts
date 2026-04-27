import {
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

type SprintWithMetrics = SprintModels.Sprint.SprintWithMetrics;

/**
 * Sprint Progress Component
 *
 * Visual progress indicator showing sprint metrics including total items,
 * completed items, in progress items, and blocked items.
 *
 */
@Component({
  selector: 'lib-sprint-progress',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './sprint-progress.component.html',
  styleUrl: './sprint-progress.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SprintProgressComponent {
  sprint = input.required<SprintWithMetrics>();
  showDetails = input<boolean>(true);

  completionPercentage = computed(() => {
    const s = this.sprint();
    if (s.total_items === 0) {
      return 0;
    }
    return Math.round((s.completed_items / s.total_items) * 100);
  });

  inProgressPercentage = computed(() => {
    const s = this.sprint();
    if (s.total_items === 0) {
      return 0;
    }
    return Math.round((s.in_progress_items / s.total_items) * 100);
  });

  blockedPercentage = computed(() => {
    const s = this.sprint();
    if (s.total_items === 0) {
      return 0;
    }
    return Math.round((s.blocked_items / s.total_items) * 100);
  });

  remainingItems = computed(() => {
    const s = this.sprint();
    return s.total_items - s.completed_items;
  });

  storyPointsPercentage = computed(() => {
    const s = this.sprint();
    if (s.total_story_points === 0) {
      return 0;
    }
    return Math.round((s.completed_story_points / s.total_story_points) * 100);
  });

  remainingStoryPoints = computed(() => {
    const s = this.sprint();
    return s.total_story_points - s.completed_story_points;
  });

  getProgressColor(): 'primary' | 'accent' | 'warn' {
    const percentage = this.completionPercentage();
    if (percentage >= 75) {
      return 'primary';
    } else if (percentage >= 50) {
      return 'accent';
    } else {
      return 'warn';
    }
  }

  getHealthIcon(): string {
    const s = this.sprint();
    const blockedPercentage = this.blockedPercentage();

    if (blockedPercentage > 20) {
      return 'error';
    } else if (s.completed_items === s.total_items && s.total_items > 0) {
      return 'check_circle';
    } else if (s.in_progress_items > 0) {
      return 'pending';
    } else {
      return 'schedule';
    }
  }

  getHealthIconColor(): string {
    const s = this.sprint();
    const blockedPercentage = this.blockedPercentage();

    if (blockedPercentage > 20) {
      return 'health-at-risk';
    } else if (s.completed_items === s.total_items && s.total_items > 0) {
      return 'health-completed';
    } else if (s.in_progress_items > 0) {
      return 'health-on-track';
    } else {
      return 'health-not-started';
    }
  }

  getHealthStatus(): string {
    const s = this.sprint();
    const blockedPercentage = this.blockedPercentage();

    if (blockedPercentage > 20) {
      return 'At Risk';
    } else if (s.completed_items === s.total_items && s.total_items > 0) {
      return 'Completed';
    } else if (s.in_progress_items > 0) {
      return 'On Track';
    } else {
      return 'Not Started';
    }
  }
}
