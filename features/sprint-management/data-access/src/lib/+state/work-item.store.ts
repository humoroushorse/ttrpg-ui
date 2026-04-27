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
import { pipe, switchMap, tap, of } from 'rxjs';
import { SharedModels } from '@ttrpg-ui/shared/models';

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
import { SprintManagementApiService } from '../service/sprint-management-api.service';
import { WebSocketService } from '../service/websocket.service';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

interface WorkItemState {
  filters: SprintModels.Filter.FilterState;
  sorts: SprintModels.Sort.SortState;
}

const initialState: WorkItemState = {
  filters: { filters: [], operator: 'AND' },
  sorts: { sorts: [] },
};

export const WorkItemStore = signalStore(
  { providedIn: 'root' },
  withState({
    ...getBaseStateWithPaginationDefault<SprintModels.WorkItem.WorkItem>(),
    ...initialState,
  }),
  withEntities<SprintModels.WorkItem.WorkItem>(),
  withComputedBase<SprintModels.WorkItem.WorkItem>(),
  withComputedPagination(),
  withComputed((store) => ({
    activeFiltersCount: computed(() => store.filters().filters.length),
    activeSortsCount: computed(() => store.sorts().sorts.length),
    getAvailableTags: computed(() => {
      const allTags = store.entities().flatMap((item) => item.tags ?? []);
      return [...new Set(allTags)].sort();
    }),
  })),
  withMethods((store, apiService = inject(SprintManagementApiService), _wsService = inject(WebSocketService)) => ({
    loadWorkItems: rxMethod<SprintModels.Api.PaginatedRequest>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap((request) =>
          apiService.getWorkItems(request).pipe(
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
                    error.error?.detail || 'Failed to load work items'
                  )
                );
              },
            })
          )
        )
      )
    ),
    loadWorkItem: rxMethod<string>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap((id) =>
          apiService.getWorkItem(id).pipe(
            tapResponse({
              next: (workItem) => {
                patchState(
                  store,
                  addEntity(workItem),
                  setSelectedEntity(workItem),
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
                    error.error?.detail || 'Failed to load work item'
                  )
                );
              },
            })
          )
        )
      )
    ),
    create: rxMethod<SprintModels.Api.CreateWorkItemRequest>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap((request) =>
          apiService.createWorkItem(request).pipe(
            tapResponse({
              next: (workItem) => {
                patchState(
                  store,
                  addEntity(workItem),
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
                    error.error?.detail || 'Failed to create work item'
                  )
                );
              },
            })
          )
        )
      )
    ),
    update: rxMethod<SprintModels.Api.UpdateWorkItemRequest>(
      pipe(
        tap((request) => {
          patchState(store, updateEntity({ id: request.id, changes: request }));
        }),
        switchMap((request) =>
          apiService.updateWorkItem(request.id, request).pipe(
            tapResponse({
              next: (workItem) => {
                patchState(
                  store,
                  updateEntity({ id: workItem.id, changes: workItem }),
                  setError(null, null)
                );
              },
              error: (error: any) => {
                apiService.getWorkItem(request.id).subscribe({
                  next: (workItem) => {
                    patchState(
                      store,
                      updateEntity({ id: workItem.id, changes: workItem }),
                      setError(
                        error.message,
                        error.error?.detail || 'Failed to update work item'
                      )
                    );
                  },
                  error: () => {
                    patchState(
                      store,
                      setError(
                        error.message,
                        error.error?.detail || 'Failed to update work item'
                      )
                    );
                  },
                });
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
          apiService.deleteWorkItem(id).pipe(
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
                    error.error?.detail || 'Failed to delete work item'
                  )
                );
              },
            })
          )
        )
      )
    ),
    bulkUpdate: rxMethod<SprintModels.Api.BulkUpdateRequest>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap((request) =>
          apiService.bulkUpdateWorkItems(request).pipe(
            tapResponse({
              next: (workItems) => {
                workItems.forEach((workItem) => {
                  patchState(store, updateEntity({ id: workItem.id, changes: workItem }));
                });
                patchState(store, setLoading(false), setError(null, null));
              },
              error: (error: any) => {
                patchState(
                  store,
                  setLoading(false),
                  setError(
                    error.message,
                    error.error?.detail || 'Failed to bulk update work items'
                  )
                );
              },
            })
          )
        )
      )
    ),
    setFilters: (filters: SprintModels.Filter.FilterState) => {
      patchState(store, {
        filters,
        pagination: { ...store.pagination(), currentPage: 1 },
      });
    },
    setSorts: (sorts: SprintModels.Sort.SortState) => {
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
    selectWorkItem: (workItem: SprintModels.WorkItem.WorkItem | null) => {
      patchState(store, setSelectedEntity(workItem));
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

    addTag: rxMethod<{ workItemId: string; tag: string }>(
      pipe(
        tap(({ workItemId, tag }) => {
          const item = store.entityMap()[workItemId];
          if (item && !item.tags.includes(tag)) {
            patchState(store, updateEntity({ id: workItemId, changes: { tags: [...item.tags, tag] } }));
          }
        }),
        switchMap(({ workItemId, tag }) => {
          const item = store.entityMap()[workItemId];
          if (!item || item.tags.includes(tag)) {
            return of(null);
          }
          return apiService.addTag(workItemId, tag).pipe(
            tapResponse({
              next: (workItem) => {
                patchState(store, updateEntity({ id: workItem.id, changes: workItem }));
              },
              error: (error: any) => {
                const original = store.entityMap()[workItemId];
                if (original) {
                  patchState(store, updateEntity({ id: workItemId, changes: { tags: original.tags.filter((t) => t !== tag) } }));
                }
                patchState(store, setError(error.message, error.error?.detail || 'Failed to add tag'));
              },
            })
          );
        })
      )
    ),

    removeTag: rxMethod<{ workItemId: string; tag: string }>(
      pipe(
        tap(({ workItemId, tag }) => {
          const item = store.entityMap()[workItemId];
          if (item) {
            patchState(store, updateEntity({ id: workItemId, changes: { tags: item.tags.filter((t) => t !== tag) } }));
          }
        }),
        switchMap(({ workItemId, tag }) =>
          apiService.removeTag(workItemId, tag).pipe(
            tapResponse({
              next: (workItem) => {
                patchState(store, updateEntity({ id: workItem.id, changes: workItem }));
              },
              error: (error: any) => {
                const original = store.entityMap()[workItemId];
                if (original && !original.tags.includes(tag)) {
                  patchState(store, updateEntity({ id: workItemId, changes: { tags: [...original.tags, tag] } }));
                }
                patchState(store, setError(error.message, error.error?.detail || 'Failed to remove tag'));
              },
            })
          )
        )
      )
    ),

    cloneWorkItem: (workItemId: string): SprintModels.Api.CreateWorkItemRequest | null => {
      const original = store.entityMap()[workItemId];
      if (!original) return null;

      const { id: _id, created_at: _ca, updated_at: _ua, created_by: _cb, updated_by: _ub, ...rest } = original;
      const cloned: SprintModels.Api.CreateWorkItemRequest = {
        ...rest,
        title: `${original.title} (Copy)`,
      };
      return cloned;
    },

    handleWorkItemCreated: (workItem: SprintModels.WorkItem.WorkItem) => {
      patchState(store, addEntity(workItem));
    },
    handleWorkItemUpdated: (workItem: SprintModels.WorkItem.WorkItem) => {
      patchState(store, updateEntity({ id: workItem.id, changes: workItem }));
    },
    handleWorkItemDeleted: (workItemId: string) => {
      patchState(store, removeEntity(workItemId));
    },
  }))
);
