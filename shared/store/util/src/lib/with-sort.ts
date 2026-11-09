import { patchState, signalStoreFeature, type, withMethods, withState } from '@ngrx/signals';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { firstPage } from './with-pagination';

/** Adds a single-column `sort`. Needs `withPagination` first. */
export function withSort() {
  return signalStoreFeature(
    { state: type<{ pagination: SharedModels.Store.PaginationState }>() },
    withState<{ sort: SharedModels.Store.Sort | null }>({ sort: null }),
    withMethods((store) => ({
      setSort(sort: SharedModels.Store.Sort | null): void {
        patchState(store, ({ pagination }) => ({ sort, ...firstPage(pagination) }));
      },
    })),
  );
}
