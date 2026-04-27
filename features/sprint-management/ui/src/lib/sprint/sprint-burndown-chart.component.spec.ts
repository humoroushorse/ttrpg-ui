import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SprintBurndownChartComponent, BurndownDataPoint } from './sprint-burndown-chart.component';

describe('SprintBurndownChartComponent', () => {
  let component: SprintBurndownChartComponent;
  let fixture: ComponentFixture<SprintBurndownChartComponent>;

  const mockDataPoints: BurndownDataPoint[] = [
    { date: '2024-01-01', remainingWork: 100, idealRemaining: 100 },
    { date: '2024-01-07', remainingWork: 60, idealRemaining: 50 },
    { date: '2024-01-14', remainingWork: 10, idealRemaining: 0 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SprintBurndownChartComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SprintBurndownChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('startDate', '2024-01-01');
    fixture.componentRef.setInput('endDate', '2024-01-14');
    fixture.componentRef.setInput('totalWork', 100);
    fixture.componentRef.setInput('dataPoints', mockDataPoints);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate sprint status correctly', () => {
    // Last point: remaining=10, ideal=0 → behind
    expect(component.sprintStatus()).toBe('behind');
  });
});
