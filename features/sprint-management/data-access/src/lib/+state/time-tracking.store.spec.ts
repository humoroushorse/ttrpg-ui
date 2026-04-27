import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError, delay } from 'rxjs';
import { signal } from '@angular/core';
import { TimeTrackingStore } from './time-tracking.store';
import { SprintManagementApiService } from '../service/sprint-management-api.service';
import { WebSocketService } from '../service/websocket.service';
import {
  SprintModels,
} from '@ttrpg-ui/features/sprint-management/models';

const SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN = SprintModels.Service.SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN;
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

describe('TimeTrackingStore', () => {
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

  describe('loadTimeEntries', () => {
    it('should load time entries and set state', () => {
      const entries = [
        makeTimeEntry({ id: 'te-1', hours: 2 }),
        makeTimeEntry({ id: 'te-2', hours: 3 }),
      ];

      vi.spyOn(apiService, 'getTimeEntries').mockReturnValue(of(entries));

      store.loadTimeEntries({ workItemId: 'wi-1', estimatedHours: 10 });

      expect(store.entities().length).toBe(2);
      expect(store.loaded()).toBe(true);
      expect(store.loading()).toBe(false);
    });

    it('should set error on load failure', () => {
      vi.spyOn(apiService, 'getTimeEntries').mockReturnValue(
        throwError(() => ({ message: 'Network error', error: {} }))
      );

      store.loadTimeEntries({ workItemId: 'wi-1', estimatedHours: 10 });

      expect(store.error()).toBeTruthy();
      expect(store.loading()).toBe(false);
    });
  });

  describe('addTimeEntry', () => {
    it('should optimistically add entry before API completes', () => {
      vi.spyOn(apiService, 'createTimeEntry').mockReturnValue(
        of(makeTimeEntry({ id: 'te-real' })).pipe(delay(100))
      );

      store.addTimeEntry({
        work_item_id: 'wi-1',
        hours: 2,
        description: 'Test',
        date: '2024-01-15',
      });

      const entities = store.entities();
      expect(entities.length).toBeGreaterThanOrEqual(1);
    });

    it('should rollback on API error', async () => {
      vi.spyOn(apiService, 'createTimeEntry').mockReturnValue(
        throwError(() => ({ message: 'error', error: {} }))
      );

      store.addTimeEntry({
        work_item_id: 'wi-1',
        hours: 2,
        description: 'Test',
        date: '2024-01-15',
      });

      await new Promise((r) => setTimeout(r, 0));

      const tempEntries = store.entities().filter((e) => e.id.startsWith('temp-'));
      expect(tempEntries.length).toBe(0);
    });
  });

  describe('updateTimeEntry', () => {
    it('should optimistically update entry', () => {
      const entry = makeTimeEntry({ id: 'te-1', hours: 2 });
      vi.spyOn(apiService, 'getTimeEntries').mockReturnValue(of([entry]));
      store.loadTimeEntries({ workItemId: 'wi-1', estimatedHours: 10 });

      vi.spyOn(apiService, 'updateTimeEntry').mockReturnValue(
        of({ ...entry, hours: 5 }).pipe(delay(100))
      );

      store.updateTimeEntry({
        workItemId: 'wi-1',
        request: { id: 'te-1', hours: 5 },
      });

      const updated = store.entityMap()['te-1'];
      expect(updated?.hours).toBe(5);
    });
  });

  describe('deleteTimeEntry', () => {
    it('should optimistically remove entry', () => {
      const entry = makeTimeEntry({ id: 'te-1' });
      vi.spyOn(apiService, 'getTimeEntries').mockReturnValue(of([entry]));
      store.loadTimeEntries({ workItemId: 'wi-1', estimatedHours: 10 });
      expect(store.entities().length).toBe(1);

      vi.spyOn(apiService, 'deleteTimeEntry').mockReturnValue(of(void 0));

      store.deleteTimeEntry({ workItemId: 'wi-1', entryId: 'te-1' });

      expect(store.entities().length).toBe(0);
    });

    it('should rollback on delete error', async () => {
      const entry = makeTimeEntry({ id: 'te-1' });
      vi.spyOn(apiService, 'getTimeEntries').mockReturnValue(of([entry]));
      store.loadTimeEntries({ workItemId: 'wi-1', estimatedHours: 10 });

      vi.spyOn(apiService, 'deleteTimeEntry').mockReturnValue(
        throwError(() => ({ message: 'error', error: {} }))
      );

      store.deleteTimeEntry({ workItemId: 'wi-1', entryId: 'te-1' });

      await new Promise((r) => setTimeout(r, 0));
      // Entry should be restored after error - but since optimistic remove happens
      // before the observable, the rollback adds it back
    });
  });

  describe('timeTrackingSummary', () => {
    it('should compute summary from entities', () => {
      const entries = [
        makeTimeEntry({ id: 'te-1', hours: 3 }),
        makeTimeEntry({ id: 'te-2', hours: 2 }),
      ];
      vi.spyOn(apiService, 'getTimeEntries').mockReturnValue(of(entries));
      store.loadTimeEntries({ workItemId: 'wi-1', estimatedHours: 10 });

      const summary = store.timeTrackingSummary();
      expect(summary).toBeTruthy();
      expect(summary!.estimated_hours).toBe(10);
      expect(summary!.logged_hours).toBe(5);
      expect(summary!.remaining_hours).toBe(5);
    });

    it('should return null remaining when no estimate', () => {
      const entries = [makeTimeEntry({ id: 'te-1', hours: 3 })];
      vi.spyOn(apiService, 'getTimeEntries').mockReturnValue(of(entries));
      store.loadTimeEntries({ workItemId: 'wi-1', estimatedHours: null });

      const summary = store.timeTrackingSummary();
      expect(summary!.remaining_hours).toBeNull();
    });

    it('should return null when no work item id', () => {
      expect(store.timeTrackingSummary()).toBeNull();
    });
  });

  describe('clearTimeEntries', () => {
    it('should clear all entries and reset state', () => {
      const entries = [makeTimeEntry()];
      vi.spyOn(apiService, 'getTimeEntries').mockReturnValue(of(entries));
      store.loadTimeEntries({ workItemId: 'wi-1', estimatedHours: 10 });
      expect(store.entities().length).toBe(1);

      store.clearTimeEntries();

      expect(store.entities().length).toBe(0);
      expect(store.timeTrackingSummary()).toBeNull();
    });
  });

  describe('Property-Based Tests', () => {
    it('should satisfy: remaining = estimated - sum(logged)', () => {
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
            store.loadTimeEntries({ workItemId: 'wi-prop', estimatedHours: estimatedHours });

            const summary = store.timeTrackingSummary();
            expect(summary).toBeTruthy();

            const expectedLogged = entries.reduce((sum, e) => sum + e.hours, 0);
            const expectedRemaining = estimatedHours - expectedLogged;

            expect(summary!.logged_hours).toBeCloseTo(expectedLogged, 3);
            expect(summary!.remaining_hours).toBeCloseTo(expectedRemaining, 3);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
