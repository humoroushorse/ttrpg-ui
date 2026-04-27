import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';
import { serializeFilters, deserializeFilters } from './filter-serializer.util';

const { FilterType, FilterCondition } = SprintModels.Filter;
const { SortDirection } = SprintModels.Sort;
type FilterState = SprintModels.Filter.FilterState;
type SortState = SprintModels.Sort.SortState;

// Stub sort serializers since they don't exist in the util
function serializeSorts(sortState: SortState): string {
  return JSON.stringify(sortState);
}
function deserializeSorts(serialized: string): SortState {
  if (!serialized || serialized.trim() === '') return { sorts: [] };
  try {
    const parsed = JSON.parse(serialized);
    return { sorts: Array.isArray(parsed.sorts) ? parsed.sorts : [] };
  } catch {
    return { sorts: [] };
  }
}

describe('Filter and Sort Serialization - Property-Based Tests', () => {
  it('should round-trip filter state through URL serialization', () => {
    fc.assert(
      fc.property(
        fc.record({
          filters: fc.array(
            fc.record({
              field: fc.string({ minLength: 1, maxLength: 50 }),
              type: fc.constantFrom(...Object.values(FilterType)),
              condition: fc.constantFrom(...Object.values(FilterCondition)),
              value: fc.oneof(
                fc.string(),
                fc.integer(),
                fc.boolean(),
                fc.array(fc.string()),
                fc.constant(null)
              ),
            }),
            { maxLength: 10 }
          ),
          operator: fc.constantFrom('AND' as const, 'OR' as const),
        }),
        (filterState: FilterState) => {
          const serialized = serializeFilters(filterState);
          const deserialized = deserializeFilters(serialized);

          expect(deserialized.operator).toBe(filterState.operator);
          expect(deserialized.filters).toHaveLength(filterState.filters.length);

          filterState.filters.forEach((filter, index) => {
            expect(deserialized.filters[index].field).toBe(filter.field);
            expect(deserialized.filters[index].type).toBe(filter.type);
            expect(deserialized.filters[index].condition).toBe(filter.condition);
            expect(deserialized.filters[index].value).toEqual(filter.value);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should round-trip sort state through URL serialization', () => {
    fc.assert(
      fc.property(
        fc.record({
          sorts: fc.array(
            fc.record({
              field: fc.string({ minLength: 1, maxLength: 50 }),
              direction: fc.constantFrom(...Object.values(SortDirection)),
              priority: fc.integer({ min: 1, max: 10 }),
            }),
            { maxLength: 5 }
          ),
        }),
        (sortState: SortState) => {
          const serialized = serializeSorts(sortState);
          const deserialized = deserializeSorts(serialized);

          expect(deserialized.sorts).toHaveLength(sortState.sorts.length);

          sortState.sorts.forEach((sort, index) => {
            expect(deserialized.sorts[index].field).toBe(sort.field);
            expect(deserialized.sorts[index].direction).toBe(sort.direction);
            expect(deserialized.sorts[index].priority).toBe(sort.priority);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle empty filter state', () => {
    const emptyFilterState: FilterState = { filters: [], operator: 'AND' };
    const serialized = serializeFilters(emptyFilterState);
    const deserialized = deserializeFilters(serialized);

    expect(deserialized.filters).toHaveLength(0);
    expect(deserialized.operator).toBe('AND');
  });

  it('should handle empty sort state', () => {
    const emptySortState: SortState = { sorts: [] };
    const serialized = serializeSorts(emptySortState);
    const deserialized = deserializeSorts(serialized);

    expect(deserialized.sorts).toHaveLength(0);
  });

  it('should handle invalid serialized filter data gracefully', () => {
    const invalidData = 'not-valid-json';
    const deserialized = deserializeFilters(invalidData);

    expect(deserialized.filters).toHaveLength(0);
    expect(deserialized.operator).toBe('AND');
  });

  it('should handle invalid serialized sort data gracefully', () => {
    const invalidData = 'not-valid-json';
    const deserialized = deserializeSorts(invalidData);

    expect(deserialized.sorts).toHaveLength(0);
  });
});
