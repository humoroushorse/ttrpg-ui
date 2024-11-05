import { inject } from '@angular/core';
import { withState, signalStore, type, patchState, withMethods, withHooks } from '@ngrx/signals';
import { setAllEntities, withEntities, addEntity, removeEntity } from '@ngrx/signals/entities';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { EventPlanningGameSystemApiService } from '../service/event-planning-game-system-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

type StoreSchema = EventPlanningModels.GameSystem.GameSystemSchema;

export type StoreState = SharedModels.Store.BaseState<StoreSchema>;

export const EventPlanningGameSystemStore = signalStore(
  // 👇 Providing `EventPlanningGameSystemStore` at the root level.
  { providedIn: 'root' },
  withEntities({ entity: type<StoreSchema>() }),
  withState<StoreState>(SharedModels.Store.getBaseStateDefault<StoreSchema>()),
  withState({
    entitySelectId: EventPlanningModels.GameSystem.selectGameSystemId,
    entityNameSingle: 'game event',
    entityNamePlural: 'game events',
  }),
  SharedModels.Store.withComputedBase<StoreSchema>(),
  withMethods(
    (
      store,
      storeService = inject(EventPlanningGameSystemApiService),
      route = inject(ActivatedRoute),
      router = inject(Router),
    ) => ({
      async getList(options?: EventPlanningModels.GameSystem.GetListInput): Promise<void> {
        patchState(store, SharedModels.Store.setLoading(true), SharedModels.Store.setError(null, null));
        await firstValueFrom(storeService.getList(options))
          .then((next) => {
            patchState(store, setAllEntities<StoreSchema>(next || [], { selectId: store.entitySelectId() }));
          })
          .catch((error: HttpErrorResponse) => {
            patchState(
              store,
              SharedModels.Store.setError(
                error.error ? error.error : error.message,
                `Error fetching ${store.entityNamePlural()}`,
              ),
            );
          })
          .finally(() => {
            patchState(store, SharedModels.Store.setLoaded(true), SharedModels.Store.setLoading(false));
          });
      },
      async post(options: EventPlanningModels.GameSystem.GameSystemPostInput, routeOnCreate = true): Promise<void> {
        patchState(store, SharedModels.Store.setLoading(true), SharedModels.Store.setError(null, null));
        await firstValueFrom(storeService.post(options))
          .then((next) => {
            if (next) {
              patchState(store, addEntity<StoreSchema>(next));
              if (routeOnCreate) {
                router.navigate(['event-planning', 'game-system', store.entitySelectId()(next)], { relativeTo: route });
              }
            }
          })
          .catch((error: HttpErrorResponse) => {
            patchState(
              store,
              SharedModels.Store.setError(
                error.error ? error.error : error.message,
                `Error creating ${store.entityNamePlural()}`,
              ),
            );
          })
          .finally(() => {
            patchState(store, SharedModels.Store.setLoading(false));
          });
      },
      async delete(entity: StoreSchema): Promise<void> {
        patchState(store, SharedModels.Store.setLoading(true), SharedModels.Store.setError(null, null));
        await firstValueFrom(storeService.delete(entity))
          .then((next) => {
            if (next) {
              patchState(store, removeEntity(entity.id));
            }
          })
          .catch((error: HttpErrorResponse) => {
            patchState(
              store,
              SharedModels.Store.setError(
                error.error ? error.error : error.message,
                `Error creating ${store.entityNamePlural()}`,
              ),
            );
          })
          .finally(() => {
            patchState(store, SharedModels.Store.setLoading(false));
          });
      },
    }),
  ),
  withHooks({
    onInit(store) {
      store.getList();
    },
    onDestroy(_store) {
      /* empty */
    },
  }),
);
