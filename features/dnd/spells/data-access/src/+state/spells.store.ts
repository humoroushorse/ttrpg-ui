import { inject } from '@angular/core';
import { withState, signalStore, type, patchState, withMethods, withHooks } from '@ngrx/signals';
import { setAllEntities, withEntities, addEntity } from '@ngrx/signals/entities';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedNotificationService } from '@ttrpg-ui/shared/notification/data-access';
import { switchMap } from 'rxjs/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { DndSpellModels } from '@ttrpg-ui/features/dnd/spells/models';
import { DndSpellApiService } from '../services/dnd-spells-api.service';

type StoreSchema = DndSpellModels.Spells.SpellSchema;
export type StoreState = SharedModels.Store.BaseState<StoreSchema>;

const getErrorMessage = (error: HttpErrorResponse): string => {
  let errorMessage = error.error ? error.error : error.message;
  if (typeof errorMessage !== 'string') {
    errorMessage = errorMessage.detail ? errorMessage.detail : JSON.stringify(errorMessage);
  }
  return errorMessage;
};

export const SpellsStore = signalStore(
  { providedIn: 'root' },
  withEntities({ entity: type<StoreSchema>() }),
  withState<StoreState>(SharedModels.Store.getBaseStateDefault<StoreSchema>()),
  withState({
    entitySelectId: DndSpellModels.Spells.selectSpellId,
    entityIdKey: DndSpellModels.Spells.selectSpellIdKey,
    entityNameSingle: 'spell',
    entityNamePlural: 'spells',
  }),
  SharedModels.Store.withComputedBase<StoreSchema>(),
  withMethods(
    (
      store,
      storeService = inject(DndSpellApiService),
      sharedNotificationService = inject(SharedNotificationService),
      route = inject(ActivatedRoute),
      router = inject(Router),
    ) => ({
      getList: rxMethod<DndSpellModels.Spells.GetListInput | undefined>(
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
      post: rxMethod<{ newEntity: DndSpellModels.Spells.SpellPostInput; routeOnCreate: boolean }>(
        switchMap((input) => {
          patchState(store, SharedModels.Store.setLoading(true), SharedModels.Store.setError(null, null));
          return storeService.post(input.newEntity).pipe(
            tapResponse({
              next: (next) => {
                if (next) {
                  patchState(store, addEntity<StoreSchema>(next));
                  sharedNotificationService.openSnackBar(
                    `Created ${store.entityNameSingle()} '${next?.name}'`,
                    'close',
                  );
                  if (input.routeOnCreate) {
                    router.navigate(['dnd', 'spells', store.entitySelectId()(next)], { relativeTo: route });
                  }
                }
                patchState(store, SharedModels.Store.setLoading(false));
              },
              error: (error: HttpErrorResponse) => {
                patchState(
                  store,
                  SharedModels.Store.setError(getErrorMessage(error), `Error creating ${store.entityNameSingle()}`),
                  SharedModels.Store.setLoading(false),
                );
                sharedNotificationService.openSnackBar(`Error creating ${store.entityNameSingle()}`, 'close');
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
