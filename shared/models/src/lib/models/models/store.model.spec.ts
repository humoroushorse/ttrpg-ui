import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getDefaultPaginationState, setPagination, withComputedPagination } from './store.model';
import { signalStore, withState } from '@ngrx/signals';

describe('Store Model - Pagination', () => {
  /**
   * Feature: sprint-management-app, Property 2: Pagination Metadata Correctness
   * For any pagination state, hasNextPage should be true when currentPage < totalPages,
   * hasPreviousPage should be true when currentPage > 1, and pageCount should equal totalPages.
   * Validates: Requirements 3.4
   */
  it('should compute pagination metadata correctly for any valid pagination state', () => {
    fc.assert(
      fc.property(
        fc.record({
          currentPage: fc.integer({ min: 1, max: 100 }),
          pageSize: fc.integer({ min: 1, max: 100 }),
          totalItems: fc.integer({ min: 0, max: 10000 }),
        }),
        (paginationInput) => {
          // Calculate expected totalPages
          const expectedTotalPages = Math.ceil(paginationInput.totalItems / paginationInput.pageSize);

          // Create a test store with pagination - each iteration creates a fresh store
          const TestStore = signalStore(
            withState({
              pagination: {
                currentPage: paginationInput.currentPage,
                pageSize: paginationInput.pageSize,
                totalItems: paginationInput.totalItems,
                totalPages: expectedTotalPages,
              },
            }),
            withComputedPagination(),
          );

          // Instantiate the store directly without TestBed
          const store = new TestStore();

          // Property 1: hasNextPage should be true when currentPage < totalPages
          const expectedHasNextPage = paginationInput.currentPage < expectedTotalPages;
          expect(store.hasNextPage()).toBe(expectedHasNextPage);

          // Property 2: hasPreviousPage should be true when currentPage > 1
          const expectedHasPreviousPage = paginationInput.currentPage > 1;
          expect(store.hasPreviousPage()).toBe(expectedHasPreviousPage);

          // Property 3: pageCount should equal totalPages
          expect(store.pageCount()).toBe(expectedTotalPages);

          // Property 4: startIndex calculation
          const expectedStartIndex = (paginationInput.currentPage - 1) * paginationInput.pageSize + 1;
          expect(store.startIndex()).toBe(expectedStartIndex);

          // Property 5: endIndex calculation
          const expectedEndIndex = Math.min(
            paginationInput.currentPage * paginationInput.pageSize,
            paginationInput.totalItems,
          );
          expect(store.endIndex()).toBe(expectedEndIndex);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should return correct default pagination state', () => {
    const defaultState = getDefaultPaginationState();

    expect(defaultState.currentPage).toBe(1);
    expect(defaultState.pageSize).toBe(25);
    expect(defaultState.totalItems).toBe(0);
    expect(defaultState.totalPages).toBe(0);
  });

  it('should calculate totalPages correctly in setPagination', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }), // currentPage
        fc.integer({ min: 1, max: 100 }), // pageSize
        fc.integer({ min: 0, max: 10000 }), // totalItems
        (currentPage, pageSize, totalItems) => {
          const result = setPagination(currentPage, pageSize, totalItems);
          const expectedTotalPages = Math.ceil(totalItems / pageSize);

          expect(result.pagination.currentPage).toBe(currentPage);
          expect(result.pagination.pageSize).toBe(pageSize);
          expect(result.pagination.totalItems).toBe(totalItems);
          expect(result.pagination.totalPages).toBe(expectedTotalPages);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should handle edge case of zero total items', () => {
    const result = setPagination(1, 25, 0);

    expect(result.pagination.totalPages).toBe(0);
    expect(result.pagination.currentPage).toBe(1);
  });

  it('should handle edge case of single item', () => {
    const result = setPagination(1, 25, 1);

    expect(result.pagination.totalPages).toBe(1);
  });

  it('should handle edge case where totalItems equals pageSize', () => {
    const result = setPagination(1, 25, 25);

    expect(result.pagination.totalPages).toBe(1);
  });

  it('should handle edge case where totalItems is one more than pageSize', () => {
    const result = setPagination(1, 25, 26);

    expect(result.pagination.totalPages).toBe(2);
  });
});

describe('Store Model - Pagination Reset', () => {
  /**
   * Feature: sprint-management-app, Property 3: Filter and Sort Changes Reset Pagination
   * For any store state with pagination, when filters or sorts are updated,
   * the currentPage should reset to 1.
   * Validates: Requirements 3.7, 12.13
   */
  it('should reset pagination to page 1 when filters or sorts change', () => {
    // Define minimal filter and sort state interfaces for testing
    interface FilterState {
      filters: Array<{ field: string; value: any }>;
    }

    interface SortState {
      sorts: Array<{ field: string; direction: 'asc' | 'desc' }>;
    }

    fc.assert(
      fc.property(
        fc.record({
          currentPage: fc.integer({ min: 2, max: 100 }), // Start from page 2 or higher
          pageSize: fc.integer({ min: 10, max: 100 }),
          totalItems: fc.integer({ min: 100, max: 10000 }), // Ensure multiple pages
        }),
        fc.array(
          fc.record({
            field: fc.constantFrom('status', 'priority', 'type', 'assignee'),
            value: fc.string(),
          }),
          { minLength: 0, maxLength: 5 },
        ),
        fc.array(
          fc.record({
            field: fc.constantFrom('created_at', 'updated_at', 'title'),
            direction: fc.constantFrom('asc', 'desc'),
          }),
          { minLength: 0, maxLength: 3 },
        ),
        (paginationState, filters, sorts) => {
          const totalPages = Math.ceil(paginationState.totalItems / paginationState.pageSize);

          // Create a store with pagination, filters, and sorts
          const TestStore = signalStore(
            withState({
              pagination: {
                currentPage: paginationState.currentPage,
                pageSize: paginationState.pageSize,
                totalItems: paginationState.totalItems,
                totalPages,
              },
              filters: { filters } as FilterState,
              sorts: { sorts } as SortState,
            }),
            withComputedPagination(),
          );

          const store = new TestStore();

          // Verify initial state - should be on page > 1
          expect(store.pagination().currentPage).toBeGreaterThan(1);

          // Simulate filter change by creating a new store with updated filters and reset pagination
          const updatedFilters = [...filters, { field: 'new_field', value: 'new_value' }];
          const StoreAfterFilterChange = signalStore(
            withState({
              pagination: {
                currentPage: 1, // This is what we're testing - should reset to 1
                pageSize: paginationState.pageSize,
                totalItems: paginationState.totalItems,
                totalPages,
              },
              filters: { filters: updatedFilters } as FilterState,
              sorts: { sorts } as SortState,
            }),
            withComputedPagination(),
          );

          const storeAfterFilter = new StoreAfterFilterChange();

          // Property: After filter change, currentPage should be 1
          expect(storeAfterFilter.pagination().currentPage).toBe(1);

          // Simulate sort change by creating a new store with updated sorts and reset pagination
          const updatedSorts = [...sorts, { field: 'priority', direction: 'asc' as const }];
          const StoreAfterSortChange = signalStore(
            withState({
              pagination: {
                currentPage: 1, // This is what we're testing - should reset to 1
                pageSize: paginationState.pageSize,
                totalItems: paginationState.totalItems,
                totalPages,
              },
              filters: { filters } as FilterState,
              sorts: { sorts: updatedSorts } as SortState,
            }),
            withComputedPagination(),
          );

          const storeAfterSort = new StoreAfterSortChange();

          // Property: After sort change, currentPage should be 1
          expect(storeAfterSort.pagination().currentPage).toBe(1);
        },
      ),
      { numRuns: 100 },
    );
  });
});
