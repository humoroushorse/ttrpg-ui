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

export const getBaseStateDefault = <T>(): BaseState<T> => {
  return {
    entityMap: {},
    ids: [],
    loading: false,
    loaded: false,
    error: null,
    errorSummary: null,
    selectedEntityId: null,
  };
};

export function withComputedBase<T>() {
  return withComputed(({ selectedEntityId, entityMap }) => ({
    selected: computed<T | null>(() => {
      const entityId = (<Signal<EntityId | null>>selectedEntityId)();
      const eMap = entityMap ? (<Signal<EntityMap<T>>>entityMap)() : undefined;
      if (eMap === undefined || !entityId) return null;
      return entityId ? (eMap as any)[entityId] : null;
    }),
  }));
}
