import { inject } from '@angular/core';
import { withState, signalStore, type, patchState, withMethods, withFeature } from '@ngrx/signals';
import { withEntities, removeEntity } from '@ngrx/signals/entities';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { SharedNotificationService } from '@ttrpg-ui/shared/notification/data-access';
import { SharedTableService } from '@ttrpg-ui/shared/table/data-access';
import {
  getErrorMessage,
  withFilters,
  withPagination,
  withServerList,
  withSort,
} from '@ttrpg-ui/shared/store/util';
import { concatMap } from 'rxjs/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { DndSpellModels } from '@ttrpg-ui/features/dnd/spells/models';
import { DndSpellApiService } from '../services/dnd-spells-api.service';

type StoreSchema = DndSpellModels.Spells.SpellSchema;
export type StoreState = SharedModels.Store.BaseState<StoreSchema>;

export const SpellsStore = signalStore(
  { providedIn: 'root' },
  // base state also defines entityMap/ids, so withEntities has to come after it
  withState<StoreState>(SharedModels.Store.getBaseStateDefault<StoreSchema>()),
  withEntities({ entity: type<StoreSchema>() }),
  withState({
    entitySelectId: DndSpellModels.Spells.selectSpellId,
    entityIdKey: DndSpellModels.Spells.selectSpellIdKey,
    entityNameSingle: 'spell',
    entityNamePlural: 'spells',
  }),
  SharedModels.Store.withComputedBase<StoreSchema>(),
  withPagination({ pageSize: () => inject(SharedTableService).selectedPageSize() }),
  withSort(),
  withFilters(),
  withFeature((_store, api = inject(DndSpellApiService), notifications = inject(SharedNotificationService)) =>
    withServerList<StoreSchema>({
      load: (query) => api.getList(query),
      errorSummary: 'Error fetching spells',
      onError: (summary) => notifications.openSnackBar(summary, 'close'),
    }),
  ),
  withMethods(
    (
      store,
      api = inject(DndSpellApiService),
      notifications = inject(SharedNotificationService),
      router = inject(Router),
    ) => {
      const failed = (summary: string) => (error: HttpErrorResponse) => {
        patchState(store, SharedModels.Store.setError(getErrorMessage(error), summary), SharedModels.Store.setLoading(false));
        notifications.openSnackBar(summary, 'close');
      };
      return {
        // concatMap: a later write must not cancel an earlier one
        create: rxMethod<{ body: DndSpellModels.Spells.SpellWrite; routeOnCreate: boolean }>(
          concatMap(({ body, routeOnCreate }) => {
            patchState(store, SharedModels.Store.setLoading(true), SharedModels.Store.setError(null, null));
            return api.create(body).pipe(
              tapResponse({
                next: (spell) => {
                  patchState(store, SharedModels.Store.setLoading(false));
                  notifications.openSnackBar(`Created ${store.entityNameSingle()} '${spell.name}'`, 'close');
                  // the new spell may land on any page, so refetch instead of adding it here
                  store.reload();
                  if (routeOnCreate) router.navigate(DndSpellModels.Spells.spellRoute(spell));
                },
                error: failed(`Error creating ${store.entityNameSingle()}`),
              }),
            );
          }),
        ),
        delete: rxMethod<StoreSchema>(
          concatMap((spell) => {
            patchState(store, SharedModels.Store.setLoading(true), SharedModels.Store.setError(null, null));
            return api.delete(spell.id).pipe(
              tapResponse({
                next: () => {
                  patchState(store, removeEntity(spell.id), SharedModels.Store.setLoading(false));
                  notifications.openSnackBar(`Deleted ${store.entityNameSingle()} '${spell.name}'`, 'close');
                  // pulls the next spell up into this page and fixes the total
                  store.reload();
                },
                error: failed(`Error deleting ${store.entityNameSingle()}`),
              }),
            );
          }),
        ),
      };
    },
  ),
);
