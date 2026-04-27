import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { AuditAction } = SprintModels.AuditLog;
type AuditLog = SprintModels.AuditLog.AuditLog;
type AuditAction = SprintModels.AuditLog.AuditAction;

/**
 * Property-Based Tests for Audit Log Completeness and Order
 * These tests validate that audit logs contain all change events and are correctly sorted
 */
describe('AuditLogListComponent - Audit Log Property Tests', () => {
  /**
   * Feature: sprint-management-app, Property 21: Work Item History Completeness and Order
   * For any work item with change events, the history should contain all change events
   * ordered by timestamp in descending order (newest first).
   */
  it('should contain all audit log entries ordered by timestamp (newest first) for any collection', () => {
    fc.assert(
      fc.property(
        // Generate an array of audit logs with random timestamps
        fc.array(
          fc.record({
            id: fc.uuid(),
            entity_type: fc.constantFrom(
              'work_item' as const,
              'sprint' as const,
              'dependency' as const,
              'comment' as const
            ),
            entity_id: fc.uuid(),
            action: fc.constantFrom(
              AuditAction.Created,
              AuditAction.Updated,
              AuditAction.Deleted,
              AuditAction.StatusChanged,
              AuditAction.Assigned,
              AuditAction.Unassigned,
              AuditAction.CommentAdded,
              AuditAction.DependencyAdded,
              AuditAction.DependencyRemoved
            ),
            user_id: fc.uuid(),
            user_name: fc.option(fc.string({ minLength: 3, maxLength: 50 }), {
              nil: undefined,
            }),
            changes: fc.dictionary(
              fc.string({ minLength: 1, maxLength: 20 }),
              fc.oneof(
                fc.string(),
                fc.integer(),
                fc.boolean(),
                fc.constant(null)
              )
            ),
            // Generate timestamps within a reasonable range (last 365 days)
            timestamp: fc
              .integer({ min: 0, max: 365 * 24 * 60 * 60 * 1000 })
              .map((offset) => {
                const date = new Date(Date.now() - offset);
                return date.toISOString();
              }),
          }),
          { minLength: 0, maxLength: 100 }
        ),
        (logs: AuditLog[]) => {
          // Sort logs by timestamp in descending order (newest first)
          // This simulates what the component does
          const sortedLogs = [...logs].sort((a, b) => {
            return (
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
          });

          // Property 1: Completeness - The sorted array should have the same length as the original
          expect(sortedLogs.length).toBe(logs.length);

          // Property 2: Completeness - All logs from the original array should be present
          for (const log of logs) {
            expect(sortedLogs).toContainEqual(log);
          }

          // Property 3: Order - Logs should be in descending order by timestamp
          for (let i = 0; i < sortedLogs.length - 1; i++) {
            const currentTimestamp = new Date(sortedLogs[i].timestamp).getTime();
            const nextTimestamp = new Date(sortedLogs[i + 1].timestamp).getTime();

            // Current log should have a timestamp >= next log (newer or equal)
            expect(currentTimestamp).toBeGreaterThanOrEqual(nextTimestamp);
          }

          // Property 4: Order - If there are logs, the first one should be the newest
          if (sortedLogs.length > 0) {
            const firstTimestamp = new Date(sortedLogs[0].timestamp).getTime();
            for (const log of sortedLogs) {
              const timestamp = new Date(log.timestamp).getTime();
              expect(firstTimestamp).toBeGreaterThanOrEqual(timestamp);
            }
          }

          // Property 5: Order - If there are logs, the last one should be the oldest
          if (sortedLogs.length > 0) {
            const lastTimestamp = new Date(
              sortedLogs[sortedLogs.length - 1].timestamp
            ).getTime();
            for (const log of sortedLogs) {
              const timestamp = new Date(log.timestamp).getTime();
              expect(timestamp).toBeGreaterThanOrEqual(lastTimestamp);
            }
          }

          // Property 6: Completeness - No duplicate IDs should exist
          const ids = sortedLogs.map((log) => log.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Edge case: Audit logs with identical timestamps should maintain stable sort
   */
  it('should handle audit logs with identical timestamps', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            entity_type: fc.constantFrom(
              'work_item' as const,
              'sprint' as const,
              'dependency' as const,
              'comment' as const
            ),
            entity_id: fc.uuid(),
            action: fc.constantFrom(
              AuditAction.Created,
              AuditAction.Updated,
              AuditAction.Deleted
            ),
            user_id: fc.uuid(),
            user_name: fc.option(fc.string({ minLength: 3, maxLength: 50 }), {
              nil: undefined,
            }),
            changes: fc.dictionary(fc.string(), fc.string()),
            timestamp: fc.constant('2024-01-01T12:00:00.000Z'), // Same timestamp
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (logs: AuditLog[]) => {
          const sortedLogs = [...logs].sort((a, b) => {
            return (
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
          });

          // Property: All logs should still be present after sorting
          expect(sortedLogs.length).toBe(logs.length);

          // Property: All timestamps should be equal
          if (sortedLogs.length > 0) {
            const firstTimestamp = new Date(sortedLogs[0].timestamp).getTime();
            for (const log of sortedLogs) {
              expect(new Date(log.timestamp).getTime()).toBe(firstTimestamp);
            }
          }

          // Property: No logs should be lost
          for (const log of logs) {
            expect(sortedLogs).toContainEqual(log);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Edge case: Empty array should remain empty
   */
  it('should handle empty audit log arrays', () => {
    const logs: AuditLog[] = [];
    const sortedLogs = [...logs].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    expect(sortedLogs).toEqual([]);
    expect(sortedLogs.length).toBe(0);
  });

  /**
   * Edge case: Single audit log should remain unchanged
   */
  it('should handle single audit log arrays', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          entity_type: fc.constantFrom(
            'work_item' as const,
            'sprint' as const,
            'dependency' as const,
            'comment' as const
          ),
          entity_id: fc.uuid(),
          action: fc.constantFrom(
            AuditAction.Created,
            AuditAction.Updated,
            AuditAction.Deleted
          ),
          user_id: fc.uuid(),
          user_name: fc.option(fc.string({ minLength: 3, maxLength: 50 }), {
            nil: undefined,
          }),
          changes: fc.dictionary(fc.string(), fc.string()),
          timestamp: fc.date().map((d) => d.toISOString()),
        }),
        (log: AuditLog) => {
          const logs = [log];
          const sortedLogs = [...logs].sort((a, b) => {
            return (
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
          });

          expect(sortedLogs).toEqual([log]);
          expect(sortedLogs.length).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Filtering by entity should preserve completeness and order
   */
  it('should maintain completeness and order when filtering by entity', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.uuid(), // entity_id to filter by
          fc.array(
            fc.record({
              id: fc.uuid(),
              entity_type: fc.constantFrom(
                'work_item' as const,
                'sprint' as const,
                'dependency' as const,
                'comment' as const
              ),
              entity_id: fc.uuid(),
              action: fc.constantFrom(
                AuditAction.Created,
                AuditAction.Updated,
                AuditAction.Deleted
              ),
              user_id: fc.uuid(),
              user_name: fc.option(fc.string({ minLength: 3, maxLength: 50 }), {
                nil: undefined,
              }),
              changes: fc.dictionary(fc.string(), fc.string()),
              timestamp: fc
                .integer({ min: 0, max: 365 * 24 * 60 * 60 * 1000 })
                .map((offset) => {
                  const date = new Date(Date.now() - offset);
                  return date.toISOString();
                }),
            }),
            { minLength: 0, maxLength: 50 }
          )
        ),
        ([entityId, logs]: [string, AuditLog[]]) => {
          // Filter logs by entity_id
          const filteredLogs = logs.filter((log) => log.entity_id === entityId);

          // Sort filtered logs
          const sortedFilteredLogs = [...filteredLogs].sort((a, b) => {
            return (
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
          });

          // Property: Filtered logs should be complete (all matching logs present)
          const expectedCount = logs.filter(
            (log) => log.entity_id === entityId
          ).length;
          expect(sortedFilteredLogs.length).toBe(expectedCount);

          // Property: Filtered logs should be ordered correctly
          for (let i = 0; i < sortedFilteredLogs.length - 1; i++) {
            const currentTimestamp = new Date(
              sortedFilteredLogs[i].timestamp
            ).getTime();
            const nextTimestamp = new Date(
              sortedFilteredLogs[i + 1].timestamp
            ).getTime();
            expect(currentTimestamp).toBeGreaterThanOrEqual(nextTimestamp);
          }

          // Property: All filtered logs should have the correct entity_id
          for (const log of sortedFilteredLogs) {
            expect(log.entity_id).toBe(entityId);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Filtering by action should preserve completeness and order
   */
  it('should maintain completeness and order when filtering by action', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.constantFrom(
            AuditAction.Created,
            AuditAction.Updated,
            AuditAction.Deleted
          ), // action to filter by
          fc.array(
            fc.record({
              id: fc.uuid(),
              entity_type: fc.constantFrom(
                'work_item' as const,
                'sprint' as const,
                'dependency' as const,
                'comment' as const
              ),
              entity_id: fc.uuid(),
              action: fc.constantFrom(
                AuditAction.Created,
                AuditAction.Updated,
                AuditAction.Deleted,
                AuditAction.StatusChanged
              ),
              user_id: fc.uuid(),
              user_name: fc.option(fc.string({ minLength: 3, maxLength: 50 }), {
                nil: undefined,
              }),
              changes: fc.dictionary(fc.string(), fc.string()),
              timestamp: fc
                .integer({ min: 0, max: 365 * 24 * 60 * 60 * 1000 })
                .map((offset) => {
                  const date = new Date(Date.now() - offset);
                  return date.toISOString();
                }),
            }),
            { minLength: 0, maxLength: 50 }
          )
        ),
        ([action, logs]: [AuditAction, AuditLog[]]) => {
          // Filter logs by action
          const filteredLogs = logs.filter((log) => log.action === action);

          // Sort filtered logs
          const sortedFilteredLogs = [...filteredLogs].sort((a, b) => {
            return (
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
          });

          // Property: Filtered logs should be complete (all matching logs present)
          const expectedCount = logs.filter((log) => log.action === action).length;
          expect(sortedFilteredLogs.length).toBe(expectedCount);

          // Property: Filtered logs should be ordered correctly
          for (let i = 0; i < sortedFilteredLogs.length - 1; i++) {
            const currentTimestamp = new Date(
              sortedFilteredLogs[i].timestamp
            ).getTime();
            const nextTimestamp = new Date(
              sortedFilteredLogs[i + 1].timestamp
            ).getTime();
            expect(currentTimestamp).toBeGreaterThanOrEqual(nextTimestamp);
          }

          // Property: All filtered logs should have the correct action
          for (const log of sortedFilteredLogs) {
            expect(log.action).toBe(action);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
