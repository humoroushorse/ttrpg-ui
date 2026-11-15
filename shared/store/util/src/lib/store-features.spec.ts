import { TestBed } from '@angular/core/testing';
import { signalStore, type, withFeature, withState } from '@ngrx/signals';
import { withEntities } from '@ngrx/signals/entities';
import { of, throwError } from 'rxjs';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { withPagination } from './with-pagination';
import { withSort } from './with-sort';
import { withFilters } from './with-filters';
import { ServerListConfig, withServerList } from './with-server-list';

interface Row {
  id: string;
}

function setup(config: Partial<ServerListConfig<Row>> = {}) {
  const load = vi.fn((query: SharedModels.Store.ListQuery) =>
    of({ entities: [{ id: `row-${query.offset}` }], total: 95 }),
  );
  const Store = signalStore(
    withState(SharedModels.Store.getBaseStateDefault<Row>()),
    withEntities({ entity: type<Row>() }),
    withPagination({ pageSize: 10 }),
    withSort(),
    withFilters(),
    withFeature(() => withServerList<Row>({ load, ...config })),
  );
  TestBed.configureTestingModule({ providers: [Store] });
  const store = TestBed.inject(Store);
  TestBed.tick();
  return { store, load };
}

const fire: SharedModels.Store.Filter = { filterType: 'text', type: 'contains', filter: 'fire' };

describe('store features', () => {
  afterEach(() => vi.useRealTimers());

  it('sort and filter changes go back to page 1', () => {
    const { store } = setup();
    store.setPage(3);
    store.setSort({ colId: 'name', sort: 'asc' });
    expect(store.pagination().currentPage).toBe(1);

    store.setPage(3);
    store.setFilter('name', fire);
    expect(store.pagination().currentPage).toBe(1);
    expect(store.filters()).toEqual({ name: fire });

    store.setFilter('name', null);
    expect(store.filters()).toEqual({});
  });

  it('setPageSize goes back to page 1 and recomputes totalPages', () => {
    const { store } = setup();
    store.setPage(5);
    store.setPageSize(25);
    expect(store.pagination()).toEqual({ currentPage: 1, pageSize: 25, totalItems: 95, totalPages: 4 });
  });

  it('loads once on init and stores the page', () => {
    const { store, load } = setup();
    expect(load).toHaveBeenCalledTimes(1);
    expect(load).toHaveBeenCalledWith({ limit: 10, offset: 0, sort: null, filters: {} });
    expect(store.entities()).toEqual([{ id: 'row-0' }]);
    expect(store.pagination()).toEqual({ currentPage: 1, pageSize: 10, totalItems: 95, totalPages: 10 });
    expect(store.loading()).toBe(false);
  });

  it('loads page changes right away and does not loop on the total update', () => {
    const { store, load } = setup();
    store.setPage(2);
    TestBed.tick();
    expect(load).toHaveBeenCalledTimes(2);
    expect(load).toHaveBeenLastCalledWith(expect.objectContaining({ offset: 10 }));
    TestBed.tick();
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('loads filter changes right away (column filters debounce typing themselves)', () => {
    const { store, load } = setup();
    store.setFilter('name', fire);
    TestBed.tick();
    expect(load).toHaveBeenCalledTimes(2);
    expect(load).toHaveBeenLastCalledWith(expect.objectContaining({ filters: { name: fire } }));
  });

  it('stores the error and calls onError', () => {
    const onError = vi.fn();
    const { store } = setup({ load: () => throwError(() => new Error('boom')), errorSummary: 'nope', onError });
    expect(store.error()).toBe('Error: boom');
    expect(store.errorSummary()).toBe('nope');
    expect(store.loading()).toBe(false);
    expect(onError).toHaveBeenCalledWith('nope', expect.any(Error));
  });
});
