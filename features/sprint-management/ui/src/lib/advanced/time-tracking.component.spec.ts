import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TimeTrackingComponent } from './time-tracking.component';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN = SprintModels.Service.SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN;
type TimeTrackingSummary = SprintModels.TimeTracking.TimeTrackingSummary;

describe('TimeTrackingComponent', () => {
  let component: TimeTrackingComponent;
  let fixture: ComponentFixture<TimeTrackingComponent>;

  const mockSummary: TimeTrackingSummary = {
    work_item_id: '1',
    estimated_hours: 10,
    logged_hours: 5,
    remaining_hours: 5,
    entries: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeTrackingComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN,
          useValue: {
            appConfig: signal({
              APP_SPRINT_MANAGEMENT__API_BASE_PATH: '/api/v1',
              APP_SPRINT_MANAGEMENT__API_URL: 'http://localhost:8003',
            }),
            initialized: signal(true),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeTrackingComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('summary', mockSummary);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit logTime when log time button is clicked', () => {
    const spy = vi.spyOn(component.logTime, 'emit');
    component.onLogTimeClick();
    expect(spy).toHaveBeenCalled();
  });

  it('should calculate progress percentage correctly', () => {
    expect(component.progressPercentage()).toBe(50);
  });

  it('should handle zero estimated hours', () => {
    const zeroSummary: TimeTrackingSummary = {
      ...mockSummary,
      estimated_hours: 0,
    };
    fixture.componentRef.setInput('summary', zeroSummary);
    fixture.detectChanges();
    expect(component.progressPercentage()).toBe(0);
  });
});
