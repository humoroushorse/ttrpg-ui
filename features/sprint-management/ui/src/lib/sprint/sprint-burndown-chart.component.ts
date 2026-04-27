import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * Burndown data point interface
 */
export interface BurndownDataPoint {
  date: string;
  remainingWork: number;
  idealRemaining: number;
}

/**
 * Sprint Burndown Chart Component
 *
 * Line chart showing remaining work over time during a sprint.
 * Uses SVG for rendering without external chart library dependencies.
 *
 */
@Component({
  selector: 'lib-sprint-burndown-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTooltipModule],
  templateUrl: './sprint-burndown-chart.component.html',
  styleUrl: './sprint-burndown-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SprintBurndownChartComponent {
  startDate = input.required<string>();
  endDate = input.required<string>();
  totalWork = input.required<number>();
  dataPoints = input.required<BurndownDataPoint[]>();

  chartWidth = input<number>(800);
  chartHeight = input<number>(400);
  padding = input<number>(60);

  innerWidth = computed(() => this.chartWidth() - 2 * this.padding());
  innerHeight = computed(() => this.chartHeight() - 2 * this.padding());

  maxY = computed(() => {
    const total = this.totalWork();
    return Math.ceil(total * 1.1);
  });

  idealLinePoints = computed(() => {
    const points = this.dataPoints();
    if (points.length === 0) return '';

    const xScale = this.innerWidth() / (points.length - 1 || 1);
    const yScale = this.innerHeight() / this.maxY();
    const padding = this.padding();

    return points
      .map((point, index) => {
        const x = padding + index * xScale;
        const y = padding + (this.maxY() - point.idealRemaining) * yScale;
        return `${x},${y}`;
      })
      .join(' ');
  });

  actualLinePoints = computed(() => {
    const points = this.dataPoints();
    if (points.length === 0) return '';

    const xScale = this.innerWidth() / (points.length - 1 || 1);
    const yScale = this.innerHeight() / this.maxY();
    const padding = this.padding();

    return points
      .map((point, index) => {
        const x = padding + index * xScale;
        const y = padding + (this.maxY() - point.remainingWork) * yScale;
        return `${x},${y}`;
      })
      .join(' ');
  });

  yAxisLabels = computed(() => {
    const maxY = this.maxY();
    const numLabels = 5;
    const step = maxY / (numLabels - 1);

    return Array.from({ length: numLabels }, (_, i) => {
      const value = Math.round(maxY - i * step);
      const y = this.padding() + (i * this.innerHeight()) / (numLabels - 1);
      return { value, y };
    });
  });

  xAxisLabels = computed(() => {
    const points = this.dataPoints();
    if (points.length === 0) return [];

    const numLabels = Math.min(points.length, 7);
    const step = Math.floor(points.length / (numLabels - 1)) || 1;

    return points
      .filter((_, index) => index % step === 0 || index === points.length - 1)
      .map((point, i) => {
        const actualIndex = i * step;
        const x = this.padding() + (actualIndex * this.innerWidth()) / (points.length - 1 || 1);
        return {
          label: this.formatDate(point.date),
          x,
        };
      });
  });

  dataPointCircles = computed(() => {
    const points = this.dataPoints();
    if (points.length === 0) return [];

    const xScale = this.innerWidth() / (points.length - 1 || 1);
    const yScale = this.innerHeight() / this.maxY();
    const padding = this.padding();

    return points.map((point, index) => {
      const x = padding + index * xScale;
      const y = padding + (this.maxY() - point.remainingWork) * yScale;
      return {
        x,
        y,
        date: point.date,
        remaining: point.remainingWork,
        ideal: point.idealRemaining,
      };
    });
  });

  sprintStatus = computed(() => {
    const points = this.dataPoints();
    if (points.length === 0) return 'unknown';

    const lastPoint = points[points.length - 1];
    if (lastPoint.remainingWork < lastPoint.idealRemaining) {
      return 'ahead';
    } else if (lastPoint.remainingWork > lastPoint.idealRemaining) {
      return 'behind';
    } else {
      return 'on-track';
    }
  });

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  getStatusIcon(): string {
    const status = this.sprintStatus();
    switch (status) {
      case 'ahead':
        return 'trending_down';
      case 'behind':
        return 'trending_up';
      case 'on-track':
        return 'trending_flat';
      default:
        return 'help';
    }
  }

  getStatusColor(): string {
    const status = this.sprintStatus();
    switch (status) {
      case 'ahead':
        return 'status-ahead';
      case 'behind':
        return 'status-behind';
      case 'on-track':
        return 'status-on-track';
      default:
        return 'status-unknown';
    }
  }

  getStatusText(): string {
    const status = this.sprintStatus();
    switch (status) {
      case 'ahead':
        return 'Ahead of Schedule';
      case 'behind':
        return 'Behind Schedule';
      case 'on-track':
        return 'On Track';
      default:
        return 'Unknown';
    }
  }
}
