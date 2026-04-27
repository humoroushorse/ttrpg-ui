import { inject } from '@angular/core';
import { withState, signalStore, type, patchState, withMethods, withHooks } from '@ngrx/signals';
import { setAllEntities, withEntities, addEntity, removeEntity, updateEntity } from '@ngrx/signals/entities';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { EventPlanningGameSystemApiService } from '../service/event-planning-game-system-api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedNotificationService } from '@ttrpg-ui/shared/notification/data-access';
import { switchMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';

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
      getList: rxMethod<EventPlanningModels.GameSystem.GetListInput | undefined>(
        switchMap((options) => {
          patchState(store, SharedModels.Store.setLoading(true), SharedModels.Store.setError(null, null));
          return storeService.getList(options).pipe(
            tapResponse({
              next: (next) => {
                patchState(store, setAllEntities<StoreSchema>(next || [], { selectId: store.entitySelectId() }));
                patchState(store, SharedModels.Store.setLoaded(true), SharedModels.Store.setLoading(false));
              },
              error: (error: HttpErrorResponse) => {
                patchState(
                  store,
                  SharedModels.Store.setError(getErrorMessage(error), `Error fetching ${store.entityNamePlural()}`),
                  SharedModels.Store.setLoaded(true),
                  SharedModels.Store.setLoading(false),
                );
                sharedNotificationService.openSnackBar(`Error fetching ${store.entityNamePlural()}`, 'close');
              },
            }),
          );
        }),
      ),
      get: rxMethod<string | null>(
        switchMap((id) => {
          if (!id) return EMPTY;
          patchState(store, SharedModels.Store.setLoading(true), SharedModels.Store.setError(null, null));
          return storeService.get(id).pipe(
            tapResponse({
              next: (next) => {
                if (next && id) {
                  patchState(
                    store,
                    updateEntity({ id, changes: next }),
                    SharedModels.Store.setSelectedEntity(next, store.entityIdKey()),
                  );
                }
                patchState(store, SharedModels.Store.setLoaded(true), SharedModels.Store.setLoading(false));
              },
              error: (error: HttpErrorResponse) => {
                patchState(
                  store,
                  SharedModels.Store.setError(getErrorMessage(error), `Error fetching ${store.entityNamePlural()}`),
                  SharedModels.Store.setLoaded(true),
                  SharedModels.Store.setLoading(false),
                );
                sharedNotificationService.openSnackBar(`Error fetching ${store.entityNamePlural()}`, 'close');
              },
            }),
          );
        }),
      ),
      post: rxMethod<{ newEntity: EventPlanningModels.GameSystem.GameSystemPostInput; routeOnCreate: boolean }>(
        switchMap((input) => {
          patchState(store, SharedModels.Store.setLoading(true), SharedModels.Store.setError(null, null));
          return storeService.post(input.newEntity).pipe(
            tapResponse({
              next: (next) => {
                if (next) {
                  patchState(store, addEntity<StoreSchema>(next));
                  sharedNotificationService.openSnackBar(`Created game system '${next?.name}'`, 'close');
                  if (input.routeOnCreate) {
                    router.navigate(['event-planning', 'game-system', store.entitySelectId()(next)], {
                      relativeTo: route,
                    });
                  }
                }
                patchState(store, SharedModels.Store.setLoading(false));
              },
              error: (error: HttpErrorResponse) => {
                patchState(
                  store,
                  SharedModels.Store.setError(getErrorMessage(error), `Error creating ${store.entityNamePlural()}`),
                  SharedModels.Store.setLoading(false),
                );
                sharedNotificationService.openSnackBar(`Error creating ${store.entityNamePlural()}`, 'close');
              },
            }),
          );
        }),
      ),
      delete: rxMethod<StoreSchema>(
        switchMap((entity) => {
          patchState(store, SharedModels.Store.setLoading(true), SharedModels.Store.setError(null, null));
          return storeService.delete(entity).pipe(
            tapResponse({
              next: (next) => {
                if (next) {
                  patchState(store, removeEntity(entity.id));
                  sharedNotificationService.openSnackBar(`Deleted game system '${entity.name}'`, 'close');
                }
                patchState(store, SharedModels.Store.setLoading(false));
              },
              error: (error: HttpErrorResponse) => {
                patchState(
                  store,
                  SharedModels.Store.setError(getErrorMessage(error), `Error deleting ${store.entityNamePlural()}`),
                  SharedModels.Store.setLoading(false),
                );
                sharedNotificationService.openSnackBar(`Error deleting ${store.entityNamePlural()}`, 'close');
              },
            }),
          );
        }),
      ),
    }),
  ),
  withHooks({
    onInit(store) {
      store.getList(undefined);
    },
    onDestroy(_store) {
      /* empty */
    },
  }),
);
