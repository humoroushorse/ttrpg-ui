import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  addEntity,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';
import { SprintManagementApiService } from '../service/sprint-management-api.service';

const {
  getBaseStateDefault,
  setError,
  setLoaded,
  setLoading,
  withComputedBase,
} = SharedModels.Store;

type TimeEntry = SprintModels.TimeTracking.TimeEntry;
type CreateTimeEntryRequest = SprintModels.TimeTracking.CreateTimeEntryRequest;
type UpdateTimeEntryRequest = SprintModels.TimeTracking.UpdateTimeEntryRequest;
type TimeTrackingSummary = SprintModels.TimeTracking.TimeTrackingSummary;

export const TimeTrackingStore = signalStore(
  { providedIn: 'root' },
  withState({
    ...getBaseStateDefault<TimeEntry>(),
    currentWorkItemId: null as string | null,
    estimatedHours: null as number | null,
  }),
  withEntities<TimeEntry>(),
  withComputedBase<TimeEntry>(),
  withComputed(({ entities, currentWorkItemId, estimatedHours }) => ({
    timeTrackingSummary: computed<TimeTrackingSummary | null>(() => {
      const workItemId = currentWorkItemId();
      if (!workItemId) return null;

      const allEntries = entities();
      const loggedHours = allEntries.reduce((sum, e) => sum + e.hours, 0);
      const est = estimatedHours();
      const remaining = est !== null ? est - loggedHours : null;

      return {
        work_item_id: workItemId,
        estimated_hours: est,
        logged_hours: loggedHours,
        remaining_hours: remaining,
        entries: allEntries.map((e) => ({ ...e })),
      };
    }),
  })),
  withMethods((store, apiService = inject(SprintManagementApiService)) => ({
    loadTimeEntries: rxMethod<{ workItemId: string; estimatedHours: number | null }>(
      pipe(
        tap(({ workItemId, estimatedHours }) =>
          patchState(store, setLoading(true), {
            currentWorkItemId: workItemId,
            estimatedHours,
          })
        ),
        switchMap(({ workItemId }) =>
          apiService.getTimeEntries(workItemId).pipe(
            tapResponse({
              next: (entries) => {
                const sorted = [...entries].sort(
                  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                patchState(
                  store,
                  setAllEntities(sorted),
                  setLoaded(true),
                  setLoading(false),
                  setError(null, null)
                );
              },
              error: (error: any) => {
                patchState(
                  store,
                  setLoading(false),
                  setError(
                    error.message,
                    error.error?.detail || 'Failed to load time entries'
                  )
                );
              },
            })
          )
        )
      )
    ),

    addTimeEntry: rxMethod<CreateTimeEntryRequest>(
      pipe(
        tap((request) => {
          const optimisticEntry: TimeEntry = {
            id: `temp-${Date.now()}`,
            work_item_id: request.work_item_id,
            user_id: 'current-user',
            hours: request.hours,
            description: request.description,
            date: request.date,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          patchState(store, addEntity(optimisticEntry), setLoading(true));
        }),
        switchMap((request) =>
          apiService.createTimeEntry(request).pipe(
            tapResponse({
              next: (entry) => {
                const tempId = store
                  .ids()
                  .find((id) => (id as string).startsWith('temp-'));
                if (tempId) {
                  patchState(store, removeEntity(tempId));
                }
                patchState(
                  store,
                  addEntity(entry),
                  setLoading(false),
                  setError(null, null)
                );
              },
              error: (error: any) => {
                const tempId = store
                  .ids()
                  .find((id) => (id as string).startsWith('temp-'));
                if (tempId) {
                  patchState(store, removeEntity(tempId));
                }
                patchState(
                  store,
                  setLoading(false),
                  setError(
                    error.message,
                    error.error?.detail || 'Failed to add time entry'
                  )
                );
              },
            })
          )
        )
      )
    ),

    updateTimeEntry: rxMethod<{ workItemId: string; request: UpdateTimeEntryRequest }>(
      pipe(
        tap(({ request }) => {
          const changes: Partial<TimeEntry> = {
            updated_at: new Date().toISOString(),
          };
          if (request.hours !== undefined) changes.hours = request.hours;
          if (request.description !== undefined) changes.description = request.description;
          if (request.date !== undefined) changes.date = request.date;
          patchState(
            store,
            updateEntity({ id: request.id, changes }),
            setLoading(true)
          );
        }),
        switchMap(({ workItemId, request }) => {
          const originalEntity = store.entityMap()[request.id];
          return apiService.updateTimeEntry(workItemId, request).pipe(
            tapResponse({
              next: (entry) => {
                patchState(
                  store,
                  updateEntity({ id: entry.id, changes: entry }),
                  setLoading(false),
                  setError(null, null)
                );
              },
              error: (error: any) => {
                if (originalEntity) {
                  patchState(
                    store,
                    updateEntity({ id: request.id, changes: originalEntity })
                  );
                }
                patchState(
                  store,
                  setLoading(false),
                  setError(
                    error.message,
                    error.error?.detail || 'Failed to update time entry'
                  )
                );
              },
            })
          );
        })
      )
    ),

    deleteTimeEntry: rxMethod<{ workItemId: string; entryId: string }>(
      pipe(
        tap(({ entryId }) => {
          patchState(store, removeEntity(entryId), setLoading(true));
        }),
        switchMap(({ workItemId, entryId }) => {
          const originalEntity = store.entityMap()[entryId];
          return apiService.deleteTimeEntry(workItemId, entryId).pipe(
            tapResponse({
              next: () => {
                patchState(
                  store,
                  setLoading(false),
                  setError(null, null)
                );
              },
              error: (error: any) => {
                if (originalEntity) {
                  patchState(store, addEntity(originalEntity));
                }
                patchState(
                  store,
                  setLoading(false),
                  setError(
                    error.message,
                    error.error?.detail || 'Failed to delete time entry'
                  )
                );
              },
            })
          );
        })
      )
    ),

    clearTimeEntries: () => {
      patchState(
        store,
        setAllEntities([] as TimeEntry[]),
        { currentWorkItemId: null, estimatedHours: null }
      );
    },
  }))
);
