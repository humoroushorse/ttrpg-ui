import { Signal, computed } from '@angular/core';
import { EntityMap } from '@ngrx/entity';
import { withComputed } from '@ngrx/signals';
import { EntityId, EntityState } from '@ngrx/signals/entities';

export function setLoading(loading: boolean): { loading: boolean } {
  return { loading };
}

export function setLoaded(loaded: boolean): { loaded: boolean } {
  return { loaded };
}

export function setError(
  error: string | null,
  errorSummary: string | null = null,
): { error: string | null; errorSummary: string | null } {
  return { error, errorSummary };
}

export function setSelectedEntity<T>(entity: T | null, idKey: EntityId = 'id'): { selectedEntityId: EntityId | null } {
  return { selectedEntityId: entity ? (entity as any)[idKey] : null };
}

// type aliases, not interfaces: ngrx feature inputs need them (ngrx#4117)
export type BaseState<T> = EntityState<T> & {
  selectedEntityId: EntityId | null;
  loading: boolean;
  loaded: boolean;
  error: string | null;
  errorSummary: string | null;
};

export const getBaseStateDefault = <T>(): BaseState<T> => ({
  entityMap: {},
  ids: [],
  loading: false,
  loaded: false,
  error: null,
  errorSummary: null,
  selectedEntityId: null,
});

export function withComputedBase<T>() {
  // ik-todo typing
  return withComputed(({ selectedEntityId, entityMap }: any) => ({
    selected: computed<T | null>(() => {
      const entityId = (<Signal<EntityId | null>>selectedEntityId)();
      const eMap = entityMap ? (<Signal<EntityMap<T>>>entityMap)() : undefined;
      if (eMap === undefined || !entityId) return null;
      return entityId ? (eMap as any)[entityId] : null;
    }),
  }));
}

// Pagination Support

export type PaginationState = {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export const getDefaultPaginationState = (): PaginationState => ({
  currentPage: 1,
  pageSize: 25,
  totalItems: 0,
  totalPages: 0,
});

export function setPagination(
  currentPage: number,
  pageSize: number,
  totalItems: number,
): { pagination: PaginationState } {
  const totalPages = Math.ceil(totalItems / pageSize);
  return { pagination: { currentPage, pageSize, totalItems, totalPages } };
}

// List query support (sort + filters + page), in AG Grid's model shapes so the API and a
// future AG Grid table speak the same thing. One condition per column for now.

/** One column of AG Grid's sort model */
export type Sort = {
  colId: string;
  sort: 'asc' | 'desc';
};

export type TextFilterType =
  | 'contains'
  | 'notContains'
  | 'equals'
  | 'notEqual'
  | 'startsWith'
  | 'endsWith'
  | 'blank'
  | 'notBlank';

export type NumberFilterType =
  | 'equals'
  | 'notEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'inRange'
  | 'blank'
  | 'notBlank';

export type DateFilterType = 'equals' | 'notEqual' | 'lessThan' | 'greaterThan' | 'inRange' | 'blank' | 'notBlank';

/** Ours: AG Grid Community has no boolean filter */
export type BooleanFilterType = 'true' | 'false' | 'blank' | 'notBlank';

export type FilterType = TextFilterType | NumberFilterType | DateFilterType | BooleanFilterType;

/** agTextColumnFilter */
export type TextFilterModel = { filterType: 'text'; type: TextFilterType; filter?: string | null };

/** agNumberColumnFilter; `inRange` includes both ends */
export type NumberFilterModel = {
  filterType: 'number';
  type: NumberFilterType;
  filter?: number | null;
  filterTo?: number | null;
};

/** agDateColumnFilter; dates are 'YYYY-MM-DD' (a year filter sends 'YYYY-01-01') */
export type DateFilterModel = {
  filterType: 'date';
  type: DateFilterType;
  dateFrom: string | null;
  dateTo: string | null;
};

/** appBooleanColumnFilter */
export type BooleanFilterModel = { filterType: 'boolean'; type: BooleanFilterType };

/** appSetColumnFilter / appApiSetColumnFilter: AG Grid's set filter model (`null` is blank) */
export type SetFilterModel = { filterType: 'set'; values: (string | null)[] };

/** One column's filter (AG Grid's filter model entry) */
export type Filter = TextFilterModel | NumberFilterModel | DateFilterModel | BooleanFilterModel | SetFilterModel;

/** AG Grid's filter model: keyed by column id. Serializable, so it can be saved and restored in one patch. */
export type Filters = Record<string, Filter>;

export type ListQuery = {
  limit: number;
  offset: number;
  sort: Sort | null;
  filters: Filters;
};

export type ListResponse<T> = {
  entities: T[];
  total: number;
};

export type BaseStateWithPagination<T> = BaseState<T> & {
  pagination: PaginationState;
};

export const getBaseStateWithPaginationDefault = <T>(): BaseStateWithPagination<T> => ({
  ...getBaseStateDefault<T>(),
  pagination: getDefaultPaginationState(),
});

export function withComputedPagination() {
  return withComputed(({ pagination }: any) => ({
    hasNextPage: computed<boolean>(() => {
      const p = (<Signal<PaginationState>>pagination)();
      return p.currentPage < p.totalPages;
    }),
    hasPreviousPage: computed<boolean>(() => {
      const p = (<Signal<PaginationState>>pagination)();
      return p.currentPage > 1;
    }),
    pageCount: computed<number>(() => {
      const p = (<Signal<PaginationState>>pagination)();
      return p.totalPages;
    }),
    startIndex: computed<number>(() => {
      const p = (<Signal<PaginationState>>pagination)();
      return (p.currentPage - 1) * p.pageSize + 1;
    }),
    endIndex: computed<number>(() => {
      const p = (<Signal<PaginationState>>pagination)();
      return Math.min(p.currentPage * p.pageSize, p.totalItems);
    }),
  }));
}
