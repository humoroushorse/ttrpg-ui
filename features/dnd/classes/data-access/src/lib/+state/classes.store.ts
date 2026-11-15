import { inject } from '@angular/core';
import { signalStore, type, withFeature, withState } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { SharedNotificationService } from '@ttrpg-ui/shared/notification/data-access';
import { SharedTableService } from '@ttrpg-ui/shared/table/data-access';
import { withFilters, withPagination, withServerList, withSort } from '@ttrpg-ui/shared/store/util';

import { DndClassModels } from '@ttrpg-ui/features/dnd/classes/models';
import { DndClassApiService } from '../services/classes-api.service';

type StoreSchema = DndClassModels.Classes.ClassSchema;

/** The classes list: one server page at a time, with the shared table's sort and filters. Read only. */
export const DndClassesStore = signalStore(
  { providedIn: 'root' },
  // the base state also defines entityMap/ids, so withEntities comes after it
  withState<SharedModels.Store.BaseState<StoreSchema>>(SharedModels.Store.getBaseStateDefault<StoreSchema>()),
  withEntities({ entity: type<StoreSchema>() }),
  withState({
    entitySelectId: DndClassModels.Classes.selectClassId,
    entityIdKey: DndClassModels.Classes.selectClassIdKey,
    entityNameSingle: 'class',
    entityNamePlural: 'classes',
  }),
  SharedModels.Store.withComputedBase<StoreSchema>(),
  withPagination({ pageSize: () => inject(SharedTableService).selectedPageSize() }),
  withSort(),
  withFilters(),
  withFeature((_store, api = inject(DndClassApiService), notifications = inject(SharedNotificationService)) =>
    withServerList<StoreSchema>({
      load: (query) => api.getList(query),
      errorSummary: 'Error fetching classes',
      onError: (summary) => notifications.openSnackBar(summary, 'close'),
    }),
  ),
);
