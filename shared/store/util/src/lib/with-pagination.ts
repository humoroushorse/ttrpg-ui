import { patchState, signalStoreFeature, withMethods, withState } from '@ngrx/signals';
import { SharedModels } from '@ttrpg-ui/shared/models';

type PaginationState = SharedModels.Store.PaginationState;

/**
 * Adds `pagination` (1-based `currentPage`) with `setPage` / `setPageSize`.
 * `pageSize` can be a function, it runs in the store's injection context.
 */
export function withPagination(config: { pageSize?: number | (() => number) } = {}) {
  return signalStoreFeature(
    withState<{ pagination: PaginationState }>(() => {
      const pageSize = typeof config.pageSize === 'function' ? config.pageSize() : (config.pageSize ?? 25);
      return { pagination: { ...SharedModels.Store.getDefaultPaginationState(), pageSize } };
    }),
    withMethods((store) => ({
      setPage(currentPage: number): void {
        patchState(store, ({ pagination }) => ({ pagination: { ...pagination, currentPage } }));
      },
      setPageSize(pageSize: number): void {
        patchState(store, ({ pagination }) => SharedModels.Store.setPagination(1, pageSize, pagination.totalItems));
      },
    })),
  );
}

/** Filter and sort changes go back to page 1 */
export const firstPage = (pagination: PaginationState): { pagination: PaginationState } => ({
  pagination: { ...pagination, currentPage: 1 },
});
