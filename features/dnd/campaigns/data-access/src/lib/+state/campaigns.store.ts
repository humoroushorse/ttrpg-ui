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

import { DndCampaignModels } from '@ttrpg-ui/features/dnd/campaigns/models';
import { DndCampaignApiService } from '../services/campaigns-api.service';

type StoreSchema = DndCampaignModels.Campaigns.CampaignSchema;

/** The campaigns list: one server page at a time, by name */
export const DndCampaignsStore = signalStore(
  { providedIn: 'root' },
  // the base state also defines entityMap/ids, so withEntities comes after it
  withState<SharedModels.Store.BaseState<StoreSchema>>(SharedModels.Store.getBaseStateDefault<StoreSchema>()),
  withEntities({ entity: type<StoreSchema>() }),
  withState({
    entitySelectId: DndCampaignModels.Campaigns.selectCampaignId,
    entityIdKey: DndCampaignModels.Campaigns.selectCampaignIdKey,
    entityNameSingle: 'campaign',
    entityNamePlural: 'campaigns',
  }),
  SharedModels.Store.withComputedBase<StoreSchema>(),
  withPagination({ pageSize: () => inject(SharedTableService).selectedPageSize() }),
  withSort(),
  withFilters(),
  withFeature((_store, api = inject(DndCampaignApiService), notifications = inject(SharedNotificationService)) =>
    withServerList<StoreSchema>({
      load: (query) => api.getList(query),
      errorSummary: 'Error fetching campaigns',
      onError: (summary) => notifications.openSnackBar(summary, 'close'),
    }),
  ),
  // Writes: concatMap so a later call can't cancel an earlier one. Each reloads the list page after,
  // and calls its callback with the result (e.g. so the page can navigate).
  withMethods((store, api = inject(DndCampaignApiService), notifications = inject(SharedNotificationService)) => {
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
        body: DndCampaignModels.Campaigns.CampaignCreate;
        onCreated?: (entity: StoreSchema) => void;
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
      update: rxMethod<{
        id: string;
        body: DndCampaignModels.Campaigns.CampaignPatch;
        onUpdated?: (entity: StoreSchema) => void;
      }>(
        concatMap(({ id, body, onUpdated }) => {
          start();
          return api.patch(id, body).pipe(
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
