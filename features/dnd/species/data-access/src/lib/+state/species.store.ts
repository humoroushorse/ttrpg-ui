import { inject } from '@angular/core';
import { signalStore, type, withFeature, withState } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { SharedNotificationService } from '@ttrpg-ui/shared/notification/data-access';
import { SharedTableService } from '@ttrpg-ui/shared/table/data-access';
import { withFilters, withPagination, withServerList, withSort } from '@ttrpg-ui/shared/store/util';

import { DndSpeciesModels } from '@ttrpg-ui/features/dnd/species/models';
import { DndSpeciesApiService } from '../services/species-api.service';

type StoreSchema = DndSpeciesModels.Species.SpeciesSchema;

/** The species list: one server page at a time, with the shared table's sort and filters. Read only. */
export const DndSpeciesStore = signalStore(
  { providedIn: 'root' },
  // the base state also defines entityMap/ids, so withEntities comes after it
  withState<SharedModels.Store.BaseState<StoreSchema>>(SharedModels.Store.getBaseStateDefault<StoreSchema>()),
  withEntities({ entity: type<StoreSchema>() }),
  withState({
    entitySelectId: DndSpeciesModels.Species.selectSpeciesId,
    entityIdKey: DndSpeciesModels.Species.selectSpeciesIdKey,
    entityNameSingle: 'species',
    entityNamePlural: 'species',
  }),
  SharedModels.Store.withComputedBase<StoreSchema>(),
  withPagination({ pageSize: () => inject(SharedTableService).selectedPageSize() }),
  withSort(),
  withFilters(),
  withFeature((_store, api = inject(DndSpeciesApiService), notifications = inject(SharedNotificationService)) =>
    withServerList<StoreSchema>({
      load: (query) => api.getList(query),
      errorSummary: 'Error fetching species',
      onError: (summary) => notifications.openSnackBar(summary, 'close'),
    }),
  ),
);
