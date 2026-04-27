/**
 * Property-Based Tests: Time Tracking Calculation
 *
 * **Validates: Requirements 2.6**
 * Property 2: For any work item with time tracking, remaining_hours SHALL equal
 * (estimated_hours - sum(logged_hours)) when both values are present.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { TimeTrackingStore } from './time-tracking.store';
import { SprintManagementApiService } from '../service/sprint-management-api.service';
import { WebSocketService } from '../service/websocket.service';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN =
  SprintModels.Service.SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN;

type TimeEntry = SprintModels.TimeTracking.TimeEntry;

const makeTimeEntry = (overrides: Partial<TimeEntry> = {}): TimeEntry => ({
  id: 'te-1',
  work_item_id: 'wi-1',
  user_id: 'user-1',
  hours: 2,
  description: 'Test work',
  date: '2024-01-15',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  ...overrides,
});

describe('TimeTrackingStore - Property-Based Tests (Property 2)', () => {
  let store: InstanceType<typeof TimeTrackingStore>;
  let apiService: SprintManagementApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
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
        WebSocketService,
        SprintManagementApiService,
        TimeTrackingStore,
      ],
    });

    store = TestBed.inject(TimeTrackingStore);
    apiService = TestBed.inject(SprintManagementApiService);
  });

  it('remaining_hours = estimated_hours - sum(logged_hours) for any valid inputs', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true }),
        fc.array(
          fc.float({ min: Math.fround(0.01), max: Math.fround(100), noNaN: true }),
          { minLength: 1, maxLength: 20 }
        ),
        (estimatedHours, hoursArray) => {
          const entries = hoursArray.map((h, i) =>
            makeTimeEntry({ id: `te-${i}`, hours: h })
          );

          vi.spyOn(apiService, 'getTimeEntries').mockReturnValue(of(entries));
          store.loadTimeEntries({ workItemId: 'wi-prop', estimatedHours });

          const summary = store.timeTrackingSummary();
          expect(summary).toBeTruthy();

          const expectedLogged = entries.reduce((sum, e) => sum + e.hours, 0);
          const expectedRemaining = estimatedHours - expectedLogged;

          if (summary) {
            expect(summary.logged_hours).toBeCloseTo(expectedLogged, 3);
            expect(summary.remaining_hours).toBeCloseTo(expectedRemaining, 3);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it('logged_hours is always the sum of all entry hours', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.float({ min: Math.fround(0.01), max: Math.fround(100), noNaN: true }),
          { minLength: 0, maxLength: 20 }
        ),
        (hoursArray) => {
          const entries = hoursArray.map((h, i) =>
            makeTimeEntry({ id: `te-${i}`, hours: h })
          );

          vi.spyOn(apiService, 'getTimeEntries').mockReturnValue(of(entries));
          store.loadTimeEntries({ workItemId: 'wi-sum', estimatedHours: 100 });

          const summary = store.timeTrackingSummary();
          const expectedLogged = entries.reduce((sum, e) => sum + e.hours, 0);

          if (summary) {
            expect(summary.logged_hours).toBeCloseTo(expectedLogged, 3);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it('remaining_hours is null when estimated_hours is null', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.float({ min: Math.fround(0.01), max: Math.fround(100), noNaN: true }),
          { minLength: 1, maxLength: 10 }
        ),
        (hoursArray) => {
          const entries = hoursArray.map((h, i) =>
            makeTimeEntry({ id: `te-${i}`, hours: h })
          );

          vi.spyOn(apiService, 'getTimeEntries').mockReturnValue(of(entries));
          store.loadTimeEntries({ workItemId: 'wi-null', estimatedHours: null });

          const summary = store.timeTrackingSummary();
          if (summary) {
            expect(summary.remaining_hours).toBeNull();
            expect(summary.estimated_hours).toBeNull();
          }
        }
      ),
      { numRuns: 200 }
    );
  });
});
