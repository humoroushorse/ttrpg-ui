import { inject } from '@angular/core';
import { withState, signalStore, type, patchState, withMethods, withHooks } from '@ngrx/signals';
import { setAllEntities, withEntities, addEntity, removeEntity, updateEntity } from '@ngrx/signals/entities';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { EventPlanningGameSystemApiService } from '../service/event-planning-game-system-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedNotificationService } from '@ttrpg-ui/shared/notification/data-access';

type StoreSchema = EventPlanningModels.GameSystem.GameSystemSchema;

export type StoreState = SharedModels.Store.BaseState<StoreSchema>;

const getErrorMessage = (error: HttpErrorResponse): string => {
  let errorMessage = error.error ? error.error : error.message;
  if (typeof errorMessage !== 'string') {
    errorMessage = errorMessage.detail ? errorMessage.detail : JSON.stringify(errorMessage);
  }
  return errorMessage;
};

export const EventPlanningGameSystemStore = signalStore(
  // 👇 Providing `EventPlanningGameSystemStore` at the root level.
  { providedIn: 'root' },
  withEntities({ entity: type<StoreSchema>() }),
  withState<StoreState>(SharedModels.Store.getBaseStateDefault<StoreSchema>()),
  withState({
    entitySelectId: EventPlanningModels.GameSystem.selectGameSystemId,
    entityIdKey: EventPlanningModels.GameSystem.selectGameSystemIdKey,
    entityNameSingle: 'game event',
    entityNamePlural: 'game events',
  }),
  SharedModels.Store.withComputedBase<StoreSchema>(),
  withMethods(
    (
      store,
      storeService = inject(EventPlanningGameSystemApiService),
      sharedNotificationService = inject(SharedNotificationService),
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
                getErrorMessage(error),
                `Error fetching ${store.entityNamePlural()}`,
              ),
            );
            sharedNotificationService.openSnackBar(`Error fetching ${store.entityNamePlural()}`, 'close')
          })
          .finally(() => {
            patchState(store, SharedModels.Store.setLoaded(true), SharedModels.Store.setLoading(false));
          });
      },
      async get(id: string | null): Promise<void> {
        if (!id) {
          // patchState(store, SharedModels.Store.setSelectedEntity(null, store.selectGameSessionIdKey()));
          return;
        }
        patchState(store, SharedModels.Store.setLoading(true), SharedModels.Store.setError(null, null));
        await firstValueFrom(storeService.get(id))
          .then((next) => {
            if (next) {
              patchState(
                store,
                updateEntity({ id, changes: next }),
                SharedModels.Store.setSelectedEntity(next, store.entityIdKey())
              );
            }
          })
          .catch((error: HttpErrorResponse) => {
            patchState(
              store,
              SharedModels.Store.setError(
                getErrorMessage(error),
                `Error fetching ${store.entityNamePlural()}`,
              ),
            );
            sharedNotificationService.openSnackBar(`Error fetching ${store.entityNamePlural()}`, 'close')
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
              sharedNotificationService.openSnackBar(`Created game system '${next?.name}'`, 'close');
              if (routeOnCreate) {
                router.navigate(['event-planning', 'game-system', store.entitySelectId()(next)], { relativeTo: route });
              }
            }
          })
          .catch((error: HttpErrorResponse) => {
            patchState(
              store,
              SharedModels.Store.setError(
                getErrorMessage(error),
                `Error creating ${store.entityNamePlural()}`,
              ),
            );
            sharedNotificationService.openSnackBar(`Error creating ${store.entityNamePlural()}`, 'close')
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
              sharedNotificationService.openSnackBar(`Deleted game system '${entity.name}'`, 'close')
            }
          })
          .catch((error: HttpErrorResponse) => {
            patchState(
              store,
              SharedModels.Store.setError(
                getErrorMessage(error),
                `Error deleting ${store.entityNamePlural()}`,
              ),
            );
            sharedNotificationService.openSnackBar(`Error deleting ${store.entityNamePlural()}`, 'close')
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
