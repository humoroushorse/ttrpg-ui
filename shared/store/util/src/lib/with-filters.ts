import { patchState, signalStoreFeature, type, withMethods, withState } from '@ngrx/signals';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { firstPage } from './with-pagination';

type Filter = SharedModels.Store.Filter;
type Filters = SharedModels.Store.Filters;

/** Adds `filters` for column and extra filters alike. Needs `withPagination` first. */
export function withFilters() {
  return signalStoreFeature(
    { state: type<{ pagination: SharedModels.Store.PaginationState }>() },
    withState<{ filters: Filters }>({ filters: {} }),
    withMethods((store) => ({
      /** `null` removes the filter */
      setFilter(key: string, filter: Filter | null): void {
        patchState(store, ({ filters, pagination }) => {
          const { [key]: _removed, ...rest } = filters;
          return { filters: filter ? { ...rest, [key]: filter } : rest, ...firstPage(pagination) };
        });
      },
      /** Replaces every filter at once, e.g. when restoring saved filters */
      setFilters(filters: Filters): void {
        patchState(store, ({ pagination }) => ({ filters, ...firstPage(pagination) }));
      },
    })),
  );
}
