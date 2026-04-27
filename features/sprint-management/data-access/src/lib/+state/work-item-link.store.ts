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

type WorkItemLink = SprintModels.WorkItemLink.WorkItemLink;
type CreateWorkItemLinkRequest = SprintModels.WorkItemLink.CreateWorkItemLinkRequest;
const { LinkType } = SprintModels.WorkItemLink;

export const WorkItemLinkStore = signalStore(
  { providedIn: 'root' },
  withState({
    ...getBaseStateDefault<WorkItemLink>(),
    currentWorkItemId: null as string | null,
  }),
  withEntities<WorkItemLink>(),
  withComputedBase<WorkItemLink>(),
  withComputed(({ entities }) => ({
    blocksLinks: computed(() =>
      entities().filter((l) => l.link_type === LinkType.Blocks)
    ),
    blockedByLinks: computed(() =>
      entities().filter((l) => l.link_type === LinkType.BlockedBy)
    ),
    relatedToLinks: computed(() =>
      entities().filter((l) => l.link_type === LinkType.RelatedTo)
    ),
    duplicateOfLinks: computed(() =>
      entities().filter((l) => l.link_type === LinkType.DuplicateOf)
    ),
    linksByType: computed(() => {
      const all = entities();
      return {
        [LinkType.Blocks]: all.filter((l) => l.link_type === LinkType.Blocks),
        [LinkType.BlockedBy]: all.filter((l) => l.link_type === LinkType.BlockedBy),
        [LinkType.RelatedTo]: all.filter((l) => l.link_type === LinkType.RelatedTo),
        [LinkType.DuplicateOf]: all.filter((l) => l.link_type === LinkType.DuplicateOf),
      };
    }),
  })),
  withMethods((store, apiService = inject(SprintManagementApiService)) => ({
    loadLinks: rxMethod<string>(
      pipe(
        tap((workItemId) =>
          patchState(store, setLoading(true), { currentWorkItemId: workItemId })
        ),
        switchMap((workItemId) =>
          apiService.getWorkItemLinks(workItemId).pipe(
            tapResponse({
              next: (links) => {
                patchState(
                  store,
                  setAllEntities(links),
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
                    error.error?.detail || 'Failed to load links'
                  )
                );
              },
            })
          )
        )
      )
    ),

    hasCircularBlocks: (
      sourceId: string,
      targetId: string,
      allLinks: WorkItemLink[]
    ): boolean => {
      const visited = new Set<string>();
      const queue = [targetId];

      while (queue.length > 0) {
        const current = queue.shift()!;
        if (current === sourceId) return true;
        if (visited.has(current)) continue;
        visited.add(current);

        const outgoing = allLinks.filter(
          (l) => l.link_type === LinkType.Blocks && l.source_work_item_id === current
        );
        for (const link of outgoing) {
          queue.push(link.target_work_item_id);
        }
      }
      return false;
    },

    createLink: rxMethod<CreateWorkItemLinkRequest>(
      pipe(
        tap((request) => {
          if (request.link_type === LinkType.Blocks) {
            const allLinks = store.entities();
            const wouldCycle = (() => {
              const visited = new Set<string>();
              const queue = [request.target_work_item_id];
              while (queue.length > 0) {
                const current = queue.shift()!;
                if (current === request.source_work_item_id) return true;
                if (visited.has(current)) continue;
                visited.add(current);
                const outgoing = allLinks.filter(
                  (l) =>
                    l.link_type === LinkType.Blocks &&
                    l.source_work_item_id === current
                );
                for (const link of outgoing) {
                  queue.push(link.target_work_item_id);
                }
              }
              return false;
            })();

            if (wouldCycle) {
              patchState(
                store,
                setError(
                  'Circular dependency detected',
                  'Cannot create a "blocks" link that would create a cycle'
                )
              );
              return;
            }
          }

          const optimistic: WorkItemLink = {
            id: `temp-${Date.now()}`,
            source_work_item_id: request.source_work_item_id,
            target_work_item_id: request.target_work_item_id,
            link_type: request.link_type,
            created_by: 'current-user',
            created_at: new Date().toISOString(),
          };
          patchState(store, addEntity(optimistic), setLoading(true));
        }),
        switchMap((request) => {
          if (request.link_type === LinkType.Blocks) {
            const allLinks = store.entities();
            const wouldCycle = (() => {
              const visited = new Set<string>();
              const queue = [request.target_work_item_id];
              while (queue.length > 0) {
                const current = queue.shift()!;
                if (current === request.source_work_item_id) return true;
                if (visited.has(current)) continue;
                visited.add(current);
                const outgoing = allLinks.filter(
                  (l) =>
                    l.link_type === LinkType.Blocks &&
                    l.source_work_item_id === current
                );
                for (const link of outgoing) {
                  queue.push(link.target_work_item_id);
                }
              }
              return false;
            })();

            if (wouldCycle) {
              const tempId = store.ids().find((id) => (id as string).startsWith('temp-'));
              if (tempId) patchState(store, removeEntity(tempId));
              patchState(store, setLoading(false));
              return [];
            }
          }

          return apiService.createWorkItemLink(request).pipe(
            tapResponse({
              next: (link) => {
                const tempId = store.ids().find((id) => (id as string).startsWith('temp-'));
                if (tempId) patchState(store, removeEntity(tempId));
                patchState(
                  store,
                  addEntity(link),
                  setLoading(false),
                  setError(null, null)
                );
              },
              error: (error: any) => {
                const tempId = store.ids().find((id) => (id as string).startsWith('temp-'));
                if (tempId) patchState(store, removeEntity(tempId));
                patchState(
                  store,
                  setLoading(false),
                  setError(
                    error.message,
                    error.error?.detail || 'Failed to create link'
                  )
                );
              },
            })
          );
        })
      )
    ),

    deleteLink: rxMethod<string>(
      pipe(
        switchMap((id) => {
          const original = store.entityMap()[id];
          patchState(store, removeEntity(id), setLoading(true));
          return apiService.deleteWorkItemLink(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, setLoading(false), setError(null, null));
              },
              error: (error: any) => {
                if (original) {
                  patchState(store, addEntity(original));
                }
                patchState(
                  store,
                  setLoading(false),
                  setError(
                    error.message,
                    error.error?.detail || 'Failed to delete link'
                  )
                );
              },
            })
          );
        })
      )
    ),

    clearLinks: () => {
      patchState(store, setAllEntities([] as WorkItemLink[]), {
        currentWorkItemId: null,
      });
    },
  }))
);
