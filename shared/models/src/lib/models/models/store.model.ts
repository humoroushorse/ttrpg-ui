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

export interface BaseState<T> extends EntityState<T> {
  selectedEntityId: EntityId | null;
  loading: boolean;
  loaded: boolean;
  error: string | null;
  errorSummary: string | null;
}

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

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export const getDefaultPaginationState = (): PaginationState => ({
  currentPage: 1,
  pageSize: 25,
  totalItems: 0,
  totalPages: 0,
});

export function setPagination(
  currentPage: number,
  pageSize: number,
  totalItems: number
): { pagination: PaginationState } {
  const totalPages = Math.ceil(totalItems / pageSize);
  return { pagination: { currentPage, pageSize, totalItems, totalPages } };
}

export interface BaseStateWithPagination<T> extends BaseState<T> {
  pagination: PaginationState;
}

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
