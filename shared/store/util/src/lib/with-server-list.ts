import { computed } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { patchState, signalStoreFeature, type, withComputed, withHooks, withMethods } from '@ngrx/signals';
import { EntityId, EntityState, setAllEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { Observable, pipe, switchMap, tap } from 'rxjs';
import { SharedModels } from '@ttrpg-ui/shared/models';

const { setError, setLoaded, setLoading, setPagination } = SharedModels.Store;

type ListQuery = SharedModels.Store.ListQuery;

export const getErrorMessage = (error: unknown): string => {
  if (!(error instanceof HttpErrorResponse)) return String(error);
  const message = error.error ? error.error : error.message;
  if (typeof message === 'string') return message;
  return message.detail ? String(message.detail) : JSON.stringify(message);
};

export interface ServerListConfig<E> {
  load: (query: ListQuery) => Observable<SharedModels.Store.ListResponse<E>>;
  /** stored as `errorSummary` and passed to `onError` */
  errorSummary?: string;
  onError?: (errorSummary: string, error: unknown) => void;
}

type ServerListState<E> = EntityState<E> &
  Pick<SharedModels.Store.BaseState<E>, 'loading' | 'loaded' | 'error' | 'errorSummary'> & {
    pagination: SharedModels.Store.PaginationState;
    sort: SharedModels.Store.Sort | null;
    filters: SharedModels.Store.Filters;
  };

/**
 * Loads one page from the server whenever page, page size, sort or filters change, right away.
 * Column filters debounce typing themselves (`filterParams.debounceMs`), so a pick from a list
 * isn't held back by a text filter's delay.
 * Needs `withEntities`, base state, `withPagination`, `withSort` and `withFilters` first.
 * Wrap it in `withFeature(() => withServerList(...))`, TS can't infer its input otherwise.
 */
export function withServerList<E extends { id: EntityId }>(config: ServerListConfig<E>) {
  const errorSummary = config.errorSummary ?? 'Error fetching data';
  return signalStoreFeature(
    { state: type<ServerListState<E>>() },
    withComputed(({ pagination, sort, filters }) => ({
      listQuery: computed<ListQuery>(
        () => {
          const { currentPage, pageSize } = pagination();
          return { limit: pageSize, offset: (currentPage - 1) * pageSize, sort: sort(), filters: filters() };
        },
        // totalItems also lives in `pagination`; ignoring it here stops a load from triggering another
        { equal: (a, b) => a.limit === b.limit && a.offset === b.offset && a.sort === b.sort && a.filters === b.filters },
      ),
    })),
    withMethods((store) => {
      const load = rxMethod<ListQuery>(
        pipe(
          tap(() => patchState(store, setLoading(true), setError(null, null))),
          switchMap((query) =>
            config.load(query).pipe(
              tapResponse({
                next: ({ entities, total }) =>
                  patchState(
                    store,
                    setAllEntities(entities),
                    setPagination(query.offset / query.limit + 1, query.limit, total),
                    setLoaded(true),
                    setLoading(false),
                  ),
                error: (error: unknown) => {
                  patchState(store, setError(getErrorMessage(error), errorSummary), setLoaded(true), setLoading(false));
                  config.onError?.(errorSummary, error);
                },
              }),
            ),
          ),
        ),
      );
      return {
        _load: load,
        /** Re-fetches the current page, e.g. after a create or delete */
        reload: (): void => {
          load(store.listQuery());
        },
      };
    }),
    withHooks({
      onInit(store) {
        store._load(store.listQuery);
      },
    }),
  );
}
