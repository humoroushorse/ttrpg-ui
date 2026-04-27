/**
 * Store Test Utilities
 *
 * Provides utilities for testing NgRx Signal Stores.
 */

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { patchState } from '@ngrx/signals';
import { addEntity, setAllEntities } from '@ngrx/signals/entities';
import { SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/features/sprint-management/models';
import {
  getBaseStateWithPaginationDefault,
  setPagination,
  setLoading,
  setLoaded,
  setError,
} from '@ttrpg-ui/shared/models';

/**
 * Configuration for store testing
 */
export interface StoreTestConfig {
  apiBasePath?: string;
  apiUrl?: string;
}

/**
 * Setup TestBed with common providers for store testing
 */
export function setupStoreTestBed(config: StoreTestConfig = {}): void {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      {
        provide: SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN,
        useValue: {
          appConfig: signal({
            APP_SPRINT_MANAGEMENT__API_BASE_PATH: config.apiBasePath || '/api/v1',
            APP_SPRINT_MANAGEMENT__API_URL: config.apiUrl || 'http://localhost:8003',
          }),
          initialized: signal(true),
        },
      },
    ],
  });
}

/**
 * Wait for store to finish loading
 */
export async function waitForStoreLoaded(store: { loading: () => boolean }, timeout = 5000): Promise<void> {
  const startTime = Date.now();

  while (store.loading() && Date.now() - startTime < timeout) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  if (store.loading()) {
    throw new Error('Store loading timeout');
  }
}

/**
 * Wait for a condition to be true
 */
export async function waitForCondition(condition: () => boolean, timeout = 5000): Promise<void> {
  const startTime = Date.now();

  while (!condition() && Date.now() - startTime < timeout) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  if (!condition()) {
    throw new Error('Condition timeout');
  }
}

/**
 * Populate store with entities
 */
export function populateStoreWithEntities<T extends { id: string }>(store: any, entities: T[]): void {
  patchState(store, setAllEntities(entities));
}

/**
 * Add single entity to store
 */
export function addEntityToStore<T extends { id: string }>(store: any, entity: T): void {
  patchState(store, addEntity(entity));
}

/**
 * Set store to loading state
 */
export function setStoreLoading(store: any): void {
  patchState(store, setLoading(true));
}

/**
 * Set store to loaded state
 */
export function setStoreLoaded(store: any): void {
  patchState(store, setLoaded(true), setLoading(false));
}

/**
 * Set store error state
 */
export function setStoreError(store: any, error: string, summary?: string): void {
  patchState(store, setError(error, summary || error));
}

/**
 * Set store pagination state
 */
export function setStorePagination(store: any, page: number, pageSize: number, totalItems: number): void {
  patchState(store, setPagination(page, pageSize, totalItems));
}

/**
 * Reset store to initial state
 */
export function resetStore<T>(store: any): void {
  patchState(store, getBaseStateWithPaginationDefault<T>());
}

/**
 * Get entity from store by ID
 */
export function getEntityFromStore<T extends { id: string }>(
  store: { entityMap: () => Record<string, T> },
  id: string,
): T | undefined {
  return store.entityMap()[id];
}

/**
 * Get all entities from store
 */
export function getAllEntitiesFromStore<T>(store: { entities: () => T[] }): T[] {
  return store.entities();
}

/**
 * Check if store has entity
 */
export function storeHasEntity(store: { entityMap: () => Record<string, any> }, id: string): boolean {
  return id in store.entityMap();
}

/**
 * Get store entity count
 */
export function getStoreEntityCount(store: { entities: () => any[] }): number {
  return store.entities().length;
}

/**
 * Assert store is in loading state
 */
export function assertStoreLoading(store: { loading: () => boolean }): void {
  if (!store.loading()) {
    throw new Error('Expected store to be loading');
  }
}

/**
 * Assert store is not in loading state
 */
export function assertStoreNotLoading(store: { loading: () => boolean }): void {
  if (store.loading()) {
    throw new Error('Expected store to not be loading');
  }
}

/**
 * Assert store has error
 */
export function assertStoreHasError(store: { error: () => string | null }): void {
  if (!store.error()) {
    throw new Error('Expected store to have error');
  }
}

/**
 * Assert store has no error
 */
export function assertStoreNoError(store: { error: () => string | null }): void {
  if (store.error()) {
    throw new Error(`Expected store to have no error, but got: ${store.error()}`);
  }
}

/**
 * Assert store pagination state
 */
export function assertStorePagination(
  store: { pagination: () => { currentPage: number; pageSize: number; totalItems: number } },
  expectedPage: number,
  expectedPageSize: number,
  expectedTotalItems: number,
): void {
  const pagination = store.pagination();

  if (pagination.currentPage !== expectedPage) {
    throw new Error(`Expected currentPage to be ${expectedPage}, got ${pagination.currentPage}`);
  }

  if (pagination.pageSize !== expectedPageSize) {
    throw new Error(`Expected pageSize to be ${expectedPageSize}, got ${pagination.pageSize}`);
  }

  if (pagination.totalItems !== expectedTotalItems) {
    throw new Error(`Expected totalItems to be ${expectedTotalItems}, got ${pagination.totalItems}`);
  }
}

/**
 * Create a spy for store method
 */
export function spyOnStoreMethod(store: any, methodName: string): any {
  const originalMethod = store[methodName];
  const calls: any[] = [];

  store[methodName] = (...args: any[]) => {
    calls.push(args);
    return originalMethod.apply(store, args);
  };

  return {
    calls,
    restore: () => {
      store[methodName] = originalMethod;
    },
  };
}

/**
 * Mock store for testing components
 */
export function createMockStore<T extends { id: string }>(
  entities: T[] = [],
  options: {
    loading?: boolean;
    loaded?: boolean;
    error?: string | null;
    errorSummary?: string | null;
  } = {},
): any {
  return {
    entities: signal(entities),
    entityMap: signal(
      entities.reduce(
        (map, entity) => {
          map[entity.id] = entity;
          return map;
        },
        {} as Record<string, T>,
      ),
    ),
    loading: signal(options.loading ?? false),
    loaded: signal(options.loaded ?? false),
    error: signal(options.error ?? null),
    errorSummary: signal(options.errorSummary ?? null),
    selectedEntity: signal(null),
    pagination: signal({
      currentPage: 1,
      pageSize: 25,
      totalItems: entities.length,
      totalPages: Math.ceil(entities.length / 25),
    }),
    filters: signal({ filters: [], operator: 'AND' as const }),
    sorts: signal({ sorts: [] }),
    hasNextPage: signal(false),
    hasPreviousPage: signal(false),
    pageCount: signal(1),
    startIndex: signal(1),
    endIndex: signal(entities.length),
  };
}
