import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * Velocity data point interface
 */
export interface VelocityDataPoint {
  sprintName: string;
  completedStoryPoints: number;
  totalStoryPoints: number;
}

/**
 * Sprint Velocity Chart Component
 *
 * Bar chart showing completed story points per sprint.
 * Uses SVG for rendering without external chart library dependencies.
 *
 */
@Component({
  selector: 'lib-sprint-velocity-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTooltipModule],
  templateUrl: './sprint-velocity-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './sprint-velocity-chart.component.scss',
})
export class SprintVelocityChartComponent {
  /**
   * Velocity data points (sprint name, completed story points)
   */
  dataPoints = input.required<VelocityDataPoint[]>();

  /**
   * Chart dimensions
   */
  chartWidth = input<number>(800);
  chartHeight = input<number>(400);
  padding = input<number>(60);

  /**
   * Computed property for chart inner dimensions
   */
  innerWidth = computed(() => this.chartWidth() - 2 * this.padding());
  innerHeight = computed(() => this.chartHeight() - 2 * this.padding());

  /**
   * Computed property for max Y value (with some padding)
   */
  maxY = computed(() => {
    const points = this.dataPoints();
    if (points.length === 0) return 100;

    const maxCompleted = Math.max(...points.map((p) => p.completedStoryPoints));
    const maxTotal = Math.max(...points.map((p) => p.totalStoryPoints));
    const max = Math.max(maxCompleted, maxTotal);

    return Math.ceil(max * 1.1); // Add 10% padding
  });

  /**
   * Computed property for bar width
   */
  barWidth = computed(() => {
    const points = this.dataPoints();
    if (points.length === 0) return 0;

    const availableWidth = this.innerWidth();
    const barSpacing = 20;
    const totalSpacing = (points.length + 1) * barSpacing;
    const barAreaWidth = availableWidth - totalSpacing;

    return Math.max(barAreaWidth / points.length, 20);
  });

  /**
   * Computed property for bars
   */
  bars = computed(() => {
    const points = this.dataPoints();
    if (points.length === 0) return [];

    const barWidth = this.barWidth();
    const barSpacing = 20;
    const yScale = this.innerHeight() / this.maxY();
    const padding = this.padding();

    return points.map((point, index) => {
      const x = padding + barSpacing + index * (barWidth + barSpacing);
      const completedHeight = point.completedStoryPoints * yScale;
      const totalHeight = point.totalStoryPoints * yScale;
      const completedY = padding + this.innerHeight() - completedHeight;
      const totalY = padding + this.innerHeight() - totalHeight;

      return {
        x,
        completedY,
        totalY,
        completedHeight,
        totalHeight,
        width: barWidth,
        sprintName: point.sprintName,
        completedStoryPoints: point.completedStoryPoints,
        totalStoryPoints: point.totalStoryPoints,
        completionPercentage:
          point.totalStoryPoints > 0 ? Math.round((point.completedStoryPoints / point.totalStoryPoints) * 100) : 0,
      };
    });
  });

  /**
   * Computed property for Y-axis labels
   */
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

  /**
   * Computed property for X-axis labels
   */
  xAxisLabels = computed(() => {
    const points = this.dataPoints();
    if (points.length === 0) return [];

    const barWidth = this.barWidth();
    const barSpacing = 20;
    const padding = this.padding();

    return points.map((point, index) => {
      const x = padding + barSpacing + index * (barWidth + barSpacing) + barWidth / 2;
      return {
        label: this.formatSprintName(point.sprintName),
        x,
      };
    });
  });

  /**
   * Computed property for average velocity
   */
  averageVelocity = computed(() => {
    const points = this.dataPoints();
    if (points.length === 0) return 0;

    const total = points.reduce((sum, point) => sum + point.completedStoryPoints, 0);
    return Math.round(total / points.length);
  });

  /**
   * Computed property for total completed story points
   */
  totalCompleted = computed(() => {
    const points = this.dataPoints();
    return points.reduce((sum, point) => sum + point.completedStoryPoints, 0);
  });

  /**
   * Computed property for velocity trend
   */
  velocityTrend = computed(() => {
    const points = this.dataPoints();
    if (points.length < 2) return 'stable';

    const recentSprints = points.slice(-3);
    const olderSprints = points.slice(0, -3);

    if (olderSprints.length === 0) return 'stable';

    const recentAvg = recentSprints.reduce((sum, p) => sum + p.completedStoryPoints, 0) / recentSprints.length;
    const olderAvg = olderSprints.reduce((sum, p) => sum + p.completedStoryPoints, 0) / olderSprints.length;

    const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (percentChange > 10) return 'increasing';
    if (percentChange < -10) return 'decreasing';
    return 'stable';
  });

  /**
   * Format sprint name for display
   */
  formatSprintName(name: string): string {
    // Truncate long sprint names
    if (name.length > 15) {
      return name.substring(0, 12) + '...';
    }
    return name;
  }

  /**
   * Get trend icon
   */
  getTrendIcon(): string {
    const trend = this.velocityTrend();
    switch (trend) {
      case 'increasing':
        return 'trending_up';
      case 'decreasing':
        return 'trending_down';
      case 'stable':
        return 'trending_flat';
      default:
        return 'help';
    }
  }

  /**
   * Get trend color
   */
  getTrendColor(): string {
    const trend = this.velocityTrend();
    switch (trend) {
      case 'increasing':
        return 'trend-increasing';
      case 'decreasing':
        return 'trend-decreasing';
      case 'stable':
        return 'trend-stable';
      default:
        return 'trend-unknown';
    }
  }

  /**
   * Get trend text
   */
  getTrendText(): string {
    const trend = this.velocityTrend();
    switch (trend) {
      case 'increasing':
        return 'Velocity Increasing';
      case 'decreasing':
        return 'Velocity Decreasing';
      case 'stable':
        return 'Velocity Stable';
      default:
        return 'Unknown';
    }
  }
}
