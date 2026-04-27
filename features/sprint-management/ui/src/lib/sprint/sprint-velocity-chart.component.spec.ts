import { describe, it, expect } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SprintVelocityChartComponent, VelocityDataPoint } from './sprint-velocity-chart.component';

describe('SprintVelocityChartComponent', () => {
  let component: SprintVelocityChartComponent;
  let fixture: ComponentFixture<SprintVelocityChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SprintVelocityChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SprintVelocityChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate average velocity correctly', () => {
    const dataPoints: VelocityDataPoint[] = [
      { sprintName: 'Sprint 1', completedStoryPoints: 20, totalStoryPoints: 25 },
      { sprintName: 'Sprint 2', completedStoryPoints: 30, totalStoryPoints: 35 },
      { sprintName: 'Sprint 3', completedStoryPoints: 25, totalStoryPoints: 30 },
    ];

    fixture.componentRef.setInput('dataPoints', dataPoints);
    fixture.detectChanges();

    // Average: (20 + 30 + 25) / 3 = 25
    expect(component.averageVelocity()).toBe(25);
  });

  it('should calculate total completed story points', () => {
    const dataPoints: VelocityDataPoint[] = [
      { sprintName: 'Sprint 1', completedStoryPoints: 20, totalStoryPoints: 25 },
      { sprintName: 'Sprint 2', completedStoryPoints: 30, totalStoryPoints: 35 },
    ];

    fixture.componentRef.setInput('dataPoints', dataPoints);
    fixture.detectChanges();

    expect(component.totalCompleted()).toBe(50);
  });

  it('should detect increasing velocity trend', () => {
    const dataPoints: VelocityDataPoint[] = [
      { sprintName: 'Sprint 1', completedStoryPoints: 10, totalStoryPoints: 20 },
      { sprintName: 'Sprint 2', completedStoryPoints: 15, totalStoryPoints: 20 },
      { sprintName: 'Sprint 3', completedStoryPoints: 20, totalStoryPoints: 25 },
      { sprintName: 'Sprint 4', completedStoryPoints: 25, totalStoryPoints: 30 },
    ];

    fixture.componentRef.setInput('dataPoints', dataPoints);
    fixture.detectChanges();

    expect(component.velocityTrend()).toBe('increasing');
  });

  it('should detect decreasing velocity trend', () => {
    const dataPoints: VelocityDataPoint[] = [
      { sprintName: 'Sprint 1', completedStoryPoints: 30, totalStoryPoints: 35 },
      { sprintName: 'Sprint 2', completedStoryPoints: 25, totalStoryPoints: 30 },
      { sprintName: 'Sprint 3', completedStoryPoints: 15, totalStoryPoints: 20 },
      { sprintName: 'Sprint 4', completedStoryPoints: 10, totalStoryPoints: 15 },
    ];

    fixture.componentRef.setInput('dataPoints', dataPoints);
    fixture.detectChanges();

    expect(component.velocityTrend()).toBe('decreasing');
  });

  it('should detect stable velocity trend', () => {
    const dataPoints: VelocityDataPoint[] = [
      { sprintName: 'Sprint 1', completedStoryPoints: 20, totalStoryPoints: 25 },
      { sprintName: 'Sprint 2', completedStoryPoints: 21, totalStoryPoints: 26 },
      { sprintName: 'Sprint 3', completedStoryPoints: 19, totalStoryPoints: 24 },
      { sprintName: 'Sprint 4', completedStoryPoints: 20, totalStoryPoints: 25 },
    ];

    fixture.componentRef.setInput('dataPoints', dataPoints);
    fixture.detectChanges();

    expect(component.velocityTrend()).toBe('stable');
  });

  it('should handle empty data points', () => {
    fixture.componentRef.setInput('dataPoints', []);
    fixture.detectChanges();

    expect(component.averageVelocity()).toBe(0);
    expect(component.totalCompleted()).toBe(0);
    expect(component.velocityTrend()).toBe('stable');
  });

  it('should format long sprint names', () => {
    const longName = 'This is a very long sprint name that should be truncated';
    const formatted = component.formatSprintName(longName);

    expect(formatted.length).toBeLessThanOrEqual(15);
    expect(formatted).toContain('...');
  });

  it('should not truncate short sprint names', () => {
    const shortName = 'Sprint 1';
    const formatted = component.formatSprintName(shortName);

    expect(formatted).toBe(shortName);
  });
});
