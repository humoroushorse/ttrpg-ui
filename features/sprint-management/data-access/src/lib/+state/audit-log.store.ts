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
  setAllEntities,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';
import { SprintManagementApiService } from '../service/sprint-management-api.service';

type AuditLog = SprintModels.AuditLog.AuditLog;
type AuditLogFilter = SprintModels.AuditLog.AuditLogFilter;

const {
  getBaseStateDefault,
  setError,
  setLoaded,
  setLoading,
  withComputedBase,
} = SharedModels.Store;

interface AuditLogState {
  filters: AuditLogFilter;
}

const initialState: AuditLogState = {
  filters: {},
};

export const AuditLogStore = signalStore(
  { providedIn: 'root' },
  withState({
    ...getBaseStateDefault<AuditLog>(),
    ...initialState,
  }),
  withEntities<AuditLog>(),
  withComputedBase<AuditLog>(),
  withComputed((store) => ({
    filteredLogs: computed(() => {
      const entities = store.entities();
      const filters = store.filters();

      return entities.filter((log) => {
        if (filters.entity_type && log.entity_type !== filters.entity_type) {
          return false;
        }
        if (filters.entity_id && log.entity_id !== filters.entity_id) {
          return false;
        }
        if (filters.user_id && log.user_id !== filters.user_id) {
          return false;
        }
        if (filters.action && log.action !== filters.action) {
          return false;
        }
        if (filters.start_date) {
          const logDate = new Date(log.timestamp);
          const startDate = new Date(filters.start_date);
          if (logDate < startDate) {
            return false;
          }
        }
        if (filters.end_date) {
          const logDate = new Date(log.timestamp);
          const endDate = new Date(filters.end_date);
          if (logDate > endDate) {
            return false;
          }
        }
        return true;
      });
    }),

    logsByEntity: computed(() => {
      const entities = store.entities();
      const grouped: Record<string, AuditLog[]> = {};

      entities.forEach((log) => {
        const key = `${log.entity_type}:${log.entity_id}`;
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(log);
      });

      return grouped;
    }),
  })),
  withMethods((store, apiService = inject(SprintManagementApiService)) => ({
    loadAuditLogs: rxMethod<AuditLogFilter>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap((filters) =>
          apiService.getAuditLogs(filters).pipe(
            tapResponse({
              next: (logs) => {
                const sortedLogs = [...logs].sort((a, b) => {
                  return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                });

                patchState(
                  store,
                  setAllEntities(sortedLogs),
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
                    error.error?.detail || 'Failed to load audit logs'
                  )
                );
              },
            })
          )
        )
      )
    ),

    filterAuditLogs: (filters: AuditLogFilter) => {
      patchState(store, { filters });
    },

    clearFilters: () => {
      patchState(store, { filters: {} });
    },

    clearAuditLogs: () => {
      patchState(store, setAllEntities([] as AuditLog[]));
    },
  }))
);
