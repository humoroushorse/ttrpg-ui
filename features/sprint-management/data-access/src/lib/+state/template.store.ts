import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';
import { SprintManagementApiService } from '../service/sprint-management-api.service';

const { getBaseStateDefault, setError, setLoaded, setLoading, withComputedBase } = SharedModels.Store;

type WorkItemTemplate = SprintModels.Template.WorkItemTemplate;
type WorkItemType = SprintModels.WorkItem.WorkItemType;

export const TemplateStore = signalStore(
  { providedIn: 'root' },
  withState({
    ...getBaseStateDefault<WorkItemTemplate>(),
  }),
  withEntities<WorkItemTemplate>(),
  withComputedBase<WorkItemTemplate>(),
  withComputed(({ entities }) => ({
    templatesByType: computed(() => {
      const map = new Map<WorkItemType, WorkItemTemplate[]>();
      for (const tpl of entities()) {
        const list = map.get(tpl.type) ?? [];
        list.push(tpl);
        map.set(tpl.type, list);
      }
      return map;
    }),
  })),
  withMethods((store, apiService = inject(SprintManagementApiService)) => ({
    loadTemplates: rxMethod<void>(
      pipe(
        tap(() => patchState(store, setLoading(true))),
        switchMap(() =>
          apiService.getWorkItemTemplates().pipe(
            tapResponse({
              next: (templates) => {
                patchState(store, setAllEntities(templates), setLoaded(true), setLoading(false), setError(null, null));
              },
              error: (error: { message?: string; error?: { detail?: string } }) => {
                patchState(
                  store,
                  setLoading(false),
                  setError(error.message ?? 'Unknown error', error.error?.detail ?? 'Failed to load templates'),
                );
              },
            }),
          ),
        ),
      ),
    ),

    applyTemplate: (templateId: string): WorkItemTemplate | null => {
      const template = store.entityMap()[templateId];
      return template ? { ...template } : null;
    },
  })),
);
