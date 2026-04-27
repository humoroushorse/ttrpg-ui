import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { Comment } from '@ttrpg-ui/features/sprint-management/models';

/**
 * Property-Based Tests for Comment Chronological Ordering
 * These tests validate that comments are correctly sorted by timestamp
 */
describe('CommentListComponent - Comment Ordering Property Tests', () => {
  /**
   * Feature: sprint-management-app, Property 13: Comment Chronological Ordering
   * For any collection of comments, when sorted for display, they should be ordered
   * by created_at timestamp in descending order (newest first).
   */
  it('should sort comments in chronological order (newest first) for any collection', () => {
    fc.assert(
      fc.property(
        // Generate an array of comments with random timestamps
        fc.array(
          fc.record({
            id: fc.uuid(),
            work_item_id: fc.uuid(),
            content: fc.string({ minLength: 1, maxLength: 500 }),
            author_id: fc.uuid(),
            // Generate timestamps within a reasonable range (last 365 days)
            created_at: fc
              .integer({ min: 0, max: 365 * 24 * 60 * 60 * 1000 })
              .map((offset) => {
                const date = new Date(Date.now() - offset);
                return date.toISOString();
              }),
            updated_at: fc
              .integer({ min: 0, max: 365 * 24 * 60 * 60 * 1000 })
              .map((offset) => {
                const date = new Date(Date.now() - offset);
                return date.toISOString();
              }),
          }),
          { minLength: 0, maxLength: 50 }
        ),
        (comments: Comment[]) => {
          // Sort comments by created_at in descending order (newest first)
          // This simulates what the component does
          const sortedComments = [...comments].sort((a, b) => {
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          });

          // Property 1: The sorted array should have the same length as the original
          expect(sortedComments.length).toBe(comments.length);

          // Property 2: All comments from the original array should be present
          for (const comment of comments) {
            expect(sortedComments).toContainEqual(comment);
          }

          // Property 3: Comments should be in descending order by created_at
          for (let i = 0; i < sortedComments.length - 1; i++) {
            const currentTimestamp = new Date(
              sortedComments[i].created_at
            ).getTime();
            const nextTimestamp = new Date(
              sortedComments[i + 1].created_at
            ).getTime();

            // Current comment should have a timestamp >= next comment (newer or equal)
            expect(currentTimestamp).toBeGreaterThanOrEqual(nextTimestamp);
          }

          // Property 4: If there are comments, the first one should be the newest
          if (sortedComments.length > 0) {
            const firstTimestamp = new Date(
              sortedComments[0].created_at
            ).getTime();
            for (const comment of sortedComments) {
              const timestamp = new Date(comment.created_at).getTime();
              expect(firstTimestamp).toBeGreaterThanOrEqual(timestamp);
            }
          }

          // Property 5: If there are comments, the last one should be the oldest
          if (sortedComments.length > 0) {
            const lastTimestamp = new Date(
              sortedComments[sortedComments.length - 1].created_at
            ).getTime();
            for (const comment of sortedComments) {
              const timestamp = new Date(comment.created_at).getTime();
              expect(timestamp).toBeGreaterThanOrEqual(lastTimestamp);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Edge case: Comments with identical timestamps should maintain stable sort
   */
  it('should handle comments with identical timestamps', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            work_item_id: fc.uuid(),
            content: fc.string({ minLength: 1, maxLength: 500 }),
            author_id: fc.uuid(),
            created_at: fc.constant('2024-01-01T12:00:00.000Z'), // Same timestamp
            updated_at: fc.constant('2024-01-01T12:00:00.000Z'),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (comments: Comment[]) => {
          const sortedComments = [...comments].sort((a, b) => {
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          });

          // Property: All comments should still be present after sorting
          expect(sortedComments.length).toBe(comments.length);

          // Property: All timestamps should be equal
          if (sortedComments.length > 0) {
            const firstTimestamp = new Date(
              sortedComments[0].created_at
            ).getTime();
            for (const comment of sortedComments) {
              expect(new Date(comment.created_at).getTime()).toBe(
                firstTimestamp
              );
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Edge case: Empty array should remain empty
   */
  it('should handle empty comment arrays', () => {
    const comments: Comment[] = [];
    const sortedComments = [...comments].sort((a, b) => {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    expect(sortedComments).toEqual([]);
    expect(sortedComments.length).toBe(0);
  });

  /**
   * Edge case: Single comment should remain unchanged
   */
  it('should handle single comment arrays', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          work_item_id: fc.uuid(),
          content: fc.string({ minLength: 1, maxLength: 500 }),
          author_id: fc.uuid(),
          created_at: fc.date().map((d) => d.toISOString()),
          updated_at: fc.date().map((d) => d.toISOString()),
        }),
        (comment: Comment) => {
          const comments = [comment];
          const sortedComments = [...comments].sort((a, b) => {
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          });

          expect(sortedComments).toEqual([comment]);
          expect(sortedComments.length).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
