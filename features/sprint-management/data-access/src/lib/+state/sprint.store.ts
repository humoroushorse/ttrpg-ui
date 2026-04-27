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

type Sprint = SprintModels.Sprint.Sprint;
type PaginatedRequest = SprintModels.Api.PaginatedRequest;
type FilterState = SprintModels.Filter.FilterState;
type SortState = SprintModels.Sort.SortState;
type CreateSprintRequest = SprintModels.Api.CreateSprintRequest;
type UpdateSprintRequest = SprintModels.Api.UpdateSprintRequest;

const {
  getBaseStateWithPaginationDefault,
  setError,
  setLoaded,
  setLoading,
  setPagination,
  setSelectedEntity,
  withComputedBase,
  withComputedPagination,
} = SharedModels.Store;

interface SprintState {
  filters: FilterState;
  sorts: SortState;
}

const initialState: SprintState = {
  filters: { filters: [], operator: 'AND' },
  sorts: { sorts: [] },
};

export const SprintStore = signalStore(
  { providedIn: 'root' },
  withState({
    ...getBaseStateWithPaginationDefault<Sprint>(),
    ...initialState,
  }),
  withEntities<Sprint>(),
  withComputedBase<Sprint>(),
  withComputedPagination(),
  withComputed((store) => ({
    activeFiltersCount: computed(() => store.filters().filters.length),

    activeSortsCount: computed(() => store.sorts().sorts.length),
  })),
  withMethods((store, apiService = inject(SprintManagementApiService)) => ({
    loadSprints: rxMethod<PaginatedRequest>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap((request) =>
          apiService.getSprints(request).pipe(
            tapResponse({
              next: (response) => {
                patchState(
                  store,
                  setAllEntities(response.items),
                  setPagination(response.page, response.page_size, response.total),
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
                    error.error?.detail || 'Failed to load sprints'
                  )
                );
              },
            })
          )
        )
      )
    ),

    loadSprint: rxMethod<string>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap((id) =>
          apiService.getSprint(id).pipe(
            tapResponse({
              next: (sprint) => {
                patchState(
                  store,
                  addEntity(sprint),
                  setSelectedEntity(sprint),
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
                    error.error?.detail || 'Failed to load sprint'
                  )
                );
              },
            })
          )
        )
      )
    ),

    create: rxMethod<CreateSprintRequest>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap((request) =>
          apiService.createSprint(request).pipe(
            tapResponse({
              next: (sprint) => {
                patchState(
                  store,
                  addEntity(sprint),
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
                    error.error?.detail || 'Failed to create sprint'
                  )
                );
              },
            })
          )
        )
      )
    ),

    update: rxMethod<UpdateSprintRequest>(
      pipe(
        tap((request) => {
          patchState(store, updateEntity({ id: request.id, changes: request }));
        }),
        switchMap((request) =>
          apiService.updateSprint(request.id, request).pipe(
            tapResponse({
              next: (sprint) => {
                patchState(
                  store,
                  updateEntity({ id: sprint.id, changes: sprint }),
                  setError(null, null)
                );
              },
              error: (error: any) => {
                patchState(
                  store,
                  setError(
                    error.message,
                    error.error?.detail || 'Failed to update sprint'
                  )
                );
              },
            })
          )
        )
      )
    ),

    delete: rxMethod<string>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap((id) =>
          apiService.deleteSprint(id).pipe(
            tapResponse({
              next: () => {
                patchState(
                  store,
                  removeEntity(id),
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
                    error.error?.detail || 'Failed to delete sprint'
                  )
                );
              },
            })
          )
        )
      )
    ),

    startSprint: rxMethod<string>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap((id) =>
          apiService.startSprint(id).pipe(
            tapResponse({
              next: (sprint) => {
                patchState(
                  store,
                  updateEntity({ id: sprint.id, changes: sprint }),
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
                    error.error?.detail || 'Failed to start sprint'
                  )
                );
              },
            })
          )
        )
      )
    ),

    completeSprint: rxMethod<string>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap((id) =>
          apiService.completeSprint(id).pipe(
            tapResponse({
              next: (sprint) => {
                patchState(
                  store,
                  updateEntity({ id: sprint.id, changes: sprint }),
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
                    error.error?.detail || 'Failed to complete sprint'
                  )
                );
              },
            })
          )
        )
      )
    ),

    setFilters: (filters: FilterState) => {
      patchState(store, {
        filters,
        pagination: { ...store.pagination(), currentPage: 1 },
      });
    },

    setSorts: (sorts: SortState) => {
      patchState(store, {
        sorts,
        pagination: { ...store.pagination(), currentPage: 1 },
      });
    },

    setPage: (page: number) => {
      patchState(store, {
        pagination: { ...store.pagination(), currentPage: page },
      });
    },

    setPageSize: (pageSize: number) => {
      patchState(store, {
        pagination: { ...store.pagination(), pageSize, currentPage: 1 },
      });
    },

    selectSprint: (sprint: Sprint | null) => {
      patchState(store, setSelectedEntity(sprint));
    },

    clearFilters: () => {
      patchState(store, {
        filters: { filters: [], operator: 'AND' },
        pagination: { ...store.pagination(), currentPage: 1 },
      });
    },

    clearSorts: () => {
      patchState(store, {
        sorts: { sorts: [] },
        pagination: { ...store.pagination(), currentPage: 1 },
      });
    },
  }))
);
