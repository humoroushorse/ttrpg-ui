import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { patchState, signalStore, type, withFeature, withMethods, withState } from '@ngrx/signals';
import { removeEntity, updateEntity, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { concatMap } from 'rxjs/operators';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { SharedNotificationService } from '@ttrpg-ui/shared/notification/data-access';
import { SharedTableService } from '@ttrpg-ui/shared/table/data-access';
import { getErrorMessage, withFilters, withPagination, withServerList, withSort } from '@ttrpg-ui/shared/store/util';

import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { DndCharacterApiService } from '../services/characters-api.service';

type StoreSchema = DndCharacterModels.Characters.CharacterSchema;

/** The characters list: one server page at a time, with the shared table's sort and filters */
export const DndCharactersStore = signalStore(
  { providedIn: 'root' },
  // the base state also defines entityMap/ids, so withEntities comes after it
  withState<SharedModels.Store.BaseState<StoreSchema>>(SharedModels.Store.getBaseStateDefault<StoreSchema>()),
  withEntities({ entity: type<StoreSchema>() }),
  withState({
    entitySelectId: DndCharacterModels.Characters.selectCharacterId,
    entityIdKey: DndCharacterModels.Characters.selectCharacterIdKey,
    entityNameSingle: 'character',
    entityNamePlural: 'characters',
  }),
  SharedModels.Store.withComputedBase<StoreSchema>(),
  withPagination({ pageSize: () => inject(SharedTableService).selectedPageSize() }),
  withSort(),
  withFilters(),
  withFeature((_store, api = inject(DndCharacterApiService), notifications = inject(SharedNotificationService)) =>
    withServerList<StoreSchema>({
      load: (query) => api.getList(query),
      errorSummary: 'Error fetching characters',
      onError: (summary) => notifications.openSnackBar(summary, 'close'),
    }),
  ),
  // Writes: concatMap so a later call can't cancel an earlier one. Each reloads the list page after,
  // and calls its callback with the result (e.g. so the page can navigate).
  withMethods((store, api = inject(DndCharacterApiService), notifications = inject(SharedNotificationService)) => {
    const start = () => patchState(store, SharedModels.Store.setLoading(true), SharedModels.Store.setError(null, null));
    const fail = (summary: string) => (error: HttpErrorResponse) => {
      patchState(
        store,
        SharedModels.Store.setError(getErrorMessage(error), summary),
        SharedModels.Store.setLoading(false),
      );
      notifications.openSnackBar(summary, 'close');
    };
    const done = (message: string) => {
      patchState(store, SharedModels.Store.setLoading(false));
      notifications.openSnackBar(message, 'close');
      store.reload();
    };
    return {
      create: rxMethod<{
        body: DndCharacterModels.Characters.CharacterCreate;
        onCreated?: (entity: DndCharacterModels.Characters.CharacterDetail) => void;
      }>(
        concatMap(({ body, onCreated }) => {
          start();
          return api.create(body).pipe(
            tapResponse({
              next: (entity) => {
                done(`Created ${store.entityNameSingle()} '${entity.name}'`);
                onCreated?.(entity);
              },
              error: fail(`Error creating ${store.entityNameSingle()}`),
            }),
          );
        }),
      ),
      // with `version`, a write over a newer version is refused (409) instead of overwriting it
      update: rxMethod<{
        id: string;
        body: DndCharacterModels.Characters.CharacterPatch;
        version?: number;
        onUpdated?: (entity: DndCharacterModels.Characters.CharacterDetail) => void;
      }>(
        concatMap(({ id, body, version, onUpdated }) => {
          start();
          return api.patch(id, body, version).pipe(
            tapResponse({
              next: (entity) => {
                patchState(store, updateEntity({ id, changes: entity }));
                done(`Saved ${store.entityNameSingle()} '${entity.name}'`);
                onUpdated?.(entity);
              },
              error: fail(`Error saving ${store.entityNameSingle()}`),
            }),
          );
        }),
      ),
      delete: rxMethod<{ entity: StoreSchema; onDeleted?: () => void }>(
        concatMap(({ entity, onDeleted }) => {
          start();
          return api.delete(entity.id).pipe(
            tapResponse({
              next: () => {
                // the reload pulls the next one up into this page and fixes the total
                patchState(store, removeEntity(entity.id));
                done(`Deleted ${store.entityNameSingle()} '${entity.name}'`);
                onDeleted?.();
              },
              error: fail(`Error deleting ${store.entityNameSingle()}`),
            }),
          );
        }),
      ),
    };
  }),
);
