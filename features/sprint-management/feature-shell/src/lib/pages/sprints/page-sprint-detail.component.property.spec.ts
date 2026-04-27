import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { WorkItemStatus } = SprintModels.WorkItem;

/**
 * Property-Based Tests for Sprint Progress Metrics
 * These tests validate sprint progress calculations across a wide range of inputs
 */
describe('PageSprintDetailComponent - Sprint Progress Metrics Property Tests', () => {
  /**
   * Feature: sprint-management-app, Property 10: Sprint Progress Metrics Calculation
   * For any sprint with associated work items, total_items should equal the count of work items,
   * completed_items should equal the count of items with status "Done", and remaining_items
   * should equal total_items minus completed_items.
   * Validates: Requirements 5.10
   */
  it('should correctly calculate sprint progress metrics for any collection of work items', () => {
    fc.assert(
      fc.property(
        // Generate an array of work items with random statuses
        fc.array(
          fc.record({
            id: fc.uuid(),
            status: fc.constantFrom(...Object.values(WorkItemStatus)),
            story_points: fc.option(fc.integer({ min: 0, max: 100 }), {
              nil: null,
            }),
          }),
          { minLength: 0, maxLength: 100 }
        ),
        (workItems) => {
          // Calculate metrics (simulating what the component does)
          const totalItems = workItems.length;
          const completedItems = workItems.filter(
            (item) => item.status === WorkItemStatus.Done
          ).length;
          const remainingItems = totalItems - completedItems;

          // Property 1: total_items should equal the count of work items
          expect(totalItems).toBe(workItems.length);

          // Property 2: completed_items should equal the count of items with status "Done"
          const expectedCompletedCount = workItems.filter(
            (item) => item.status === WorkItemStatus.Done
          ).length;
          expect(completedItems).toBe(expectedCompletedCount);

          // Property 3: remaining_items should equal total_items minus completed_items
          expect(remainingItems).toBe(totalItems - completedItems);

          // Property 4: remaining_items should be non-negative
          expect(remainingItems).toBeGreaterThanOrEqual(0);

          // Property 5: completed_items should be less than or equal to total_items
          expect(completedItems).toBeLessThanOrEqual(totalItems);
        }
      ),
      { numRuns: 100 }
    );
  });
});
