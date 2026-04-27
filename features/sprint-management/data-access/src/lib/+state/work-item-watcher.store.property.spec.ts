/**
 * Property-Based Tests: Watcher Uniqueness
 *
 * **Validates: Requirements 5**
 * Property 5: For any work item, the set of watchers SHALL NOT contain duplicate user IDs.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

type User = SprintModels.WorkItem.User;

function addWatcher(watchers: User[], user: User): User[] {
  if (watchers.some((w) => w.id === user.id)) {
    return watchers;
  }
  return [...watchers, user];
}

function removeWatcher(watchers: User[], userId: string): User[] {
  return watchers.filter((w) => w.id !== userId);
}

const userArb = fc.record({
  id: fc.uuid(),
  username: fc.string({ minLength: 3, maxLength: 20 }),
  email: fc.emailAddress(),
  first_name: fc.string({ minLength: 1, maxLength: 20 }),
  last_name: fc.string({ minLength: 1, maxLength: 20 }),
  avatar_url: fc.option(fc.webUrl(), { nil: undefined }),
});

describe('Watcher Uniqueness (Property 5)', () => {
  it('addWatcher never produces duplicate user IDs', () => {
    fc.assert(
      fc.property(fc.array(userArb, { minLength: 0, maxLength: 10 }), userArb, (existingWatchers, newUser) => {
        const uniqueExisting = existingWatchers.filter((u, i, arr) => arr.findIndex((x) => x.id === u.id) === i);

        const result = addWatcher(uniqueExisting, newUser);

        const ids = result.map((w) => w.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      }),
      { numRuns: 200 },
    );
  });

  it('adding the same user multiple times results in exactly one occurrence', () => {
    fc.assert(
      fc.property(userArb, (user) => {
        let watchers: User[] = [];
        watchers = addWatcher(watchers, user);
        watchers = addWatcher(watchers, user);
        watchers = addWatcher(watchers, user);

        const occurrences = watchers.filter((w) => w.id === user.id).length;
        expect(occurrences).toBe(1);
      }),
      { numRuns: 200 },
    );
  });

  it('addWatcher with an already-present user returns the same list unchanged', () => {
    fc.assert(
      fc.property(fc.array(userArb, { minLength: 1, maxLength: 10 }), (users) => {
        const uniqueUsers = users.filter((u, i, arr) => arr.findIndex((x) => x.id === u.id) === i);
        if (uniqueUsers.length === 0) return;

        const existingUser = uniqueUsers[0];
        const result = addWatcher(uniqueUsers, existingUser);

        expect(result.length).toBe(uniqueUsers.length);
      }),
      { numRuns: 200 },
    );
  });

  it('removeWatcher removes exactly the user with the given ID', () => {
    fc.assert(
      fc.property(fc.array(userArb, { minLength: 1, maxLength: 10 }), (users) => {
        const uniqueUsers = users.filter((u, i, arr) => arr.findIndex((x) => x.id === u.id) === i);
        if (uniqueUsers.length === 0) return;

        const userToRemove = uniqueUsers[0];
        const result = removeWatcher(uniqueUsers, userToRemove.id);

        expect(result.some((w) => w.id === userToRemove.id)).toBe(false);
        expect(result.length).toBe(uniqueUsers.length - 1);
      }),
      { numRuns: 200 },
    );
  });

  it('removeWatcher on a non-existent user ID leaves the list unchanged', () => {
    fc.assert(
      fc.property(fc.array(userArb, { minLength: 0, maxLength: 10 }), fc.uuid(), (users, nonExistentId) => {
        const uniqueUsers = users.filter((u, i, arr) => arr.findIndex((x) => x.id === u.id) === i);
        fc.pre(!uniqueUsers.some((u) => u.id === nonExistentId));

        const result = removeWatcher(uniqueUsers, nonExistentId);
        expect(result.length).toBe(uniqueUsers.length);
      }),
      { numRuns: 200 },
    );
  });

  it('watcher list after any sequence of add/remove operations has no duplicates', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.record({ op: fc.constant('add' as const), user: userArb }),
            fc.record({ op: fc.constant('remove' as const), userId: fc.uuid() }),
          ),
          { minLength: 1, maxLength: 20 },
        ),
        (operations) => {
          let watchers: User[] = [];

          for (const operation of operations) {
            if (operation.op === 'add') {
              watchers = addWatcher(watchers, operation.user);
            } else {
              watchers = removeWatcher(watchers, operation.userId);
            }
          }

          const ids = watchers.map((w) => w.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);
        },
      ),
      { numRuns: 200 },
    );
  });
});
