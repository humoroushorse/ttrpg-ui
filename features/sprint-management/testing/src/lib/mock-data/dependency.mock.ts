/**
 * Dependency Mock Data Generators
 *
 * Provides mock data generators for work item dependencies.
 */

import { Dependency, DependencyType, DependencyWithWorkItems } from '@ttrpg-ui/features/sprint-management/models';
import { generateMockId, createMockWorkItem } from './work-item.mock';

/**
 * Create a mock dependency with default values
 */
export function createMockDependency(overrides?: Partial<Dependency>): Dependency {
  const id = generateMockId();
  const now = new Date().toISOString();

  return {
    id,
    source_work_item_id: 'work-item-1',
    target_work_item_id: 'work-item-2',
    dependency_type: DependencyType.Blocks,
    created_by: 'user-1',
    created_at: now,
    ...overrides,
  };
}

/**
 * Create a mock dependency with work items
 */
export function createMockDependencyWithWorkItems(
  overrides?: Partial<DependencyWithWorkItems>,
): DependencyWithWorkItems {
  const dependency = createMockDependency(overrides);
  const sourceWorkItem = overrides?.source_work_item || createMockWorkItem({ id: dependency.source_work_item_id });
  const targetWorkItem = overrides?.target_work_item || createMockWorkItem({ id: dependency.target_work_item_id });

  return {
    ...dependency,
    source_work_item: sourceWorkItem,
    target_work_item: targetWorkItem,
  };
}

/**
 * Create multiple mock dependencies
 */
export function createMockDependencies(count: number, overrides?: Partial<Dependency>): Dependency[] {
  return Array.from({ length: count }, () => createMockDependency(overrides));
}

/**
 * Create a "blocks" dependency
 */
export function createMockBlocksDependency(
  sourceId: string,
  targetId: string,
  overrides?: Partial<Dependency>,
): Dependency {
  return createMockDependency({
    source_work_item_id: sourceId,
    target_work_item_id: targetId,
    dependency_type: DependencyType.Blocks,
    ...overrides,
  });
}

/**
 * Create a "blocked by" dependency
 */
export function createMockBlockedByDependency(
  sourceId: string,
  targetId: string,
  overrides?: Partial<Dependency>,
): Dependency {
  return createMockDependency({
    source_work_item_id: sourceId,
    target_work_item_id: targetId,
    dependency_type: DependencyType.BlockedBy,
    ...overrides,
  });
}

/**
 * Create a dependency chain (A blocks B, B blocks C, etc.)
 */
export function createMockDependencyChain(workItemIds: string[]): Dependency[] {
  const dependencies: Dependency[] = [];

  for (let i = 0; i < workItemIds.length - 1; i++) {
    dependencies.push(createMockBlocksDependency(workItemIds[i], workItemIds[i + 1]));
  }

  return dependencies;
}

/**
 * Create a circular dependency (for testing validation)
 * Creates: A blocks B, B blocks C, C blocks A
 */
export function createMockCircularDependencies(workItemIds: string[]): Dependency[] {
  if (workItemIds.length < 2) {
    throw new Error('Need at least 2 work items to create circular dependencies');
  }

  const dependencies: Dependency[] = [];

  // Create chain
  for (let i = 0; i < workItemIds.length - 1; i++) {
    dependencies.push(createMockBlocksDependency(workItemIds[i], workItemIds[i + 1]));
  }

  // Close the circle
  dependencies.push(createMockBlocksDependency(workItemIds[workItemIds.length - 1], workItemIds[0]));

  return dependencies;
}

/**
 * Create dependencies for a specific work item
 */
export function createMockDependenciesForWorkItem(
  workItemId: string,
  count: number,
  type: DependencyType = DependencyType.Blocks,
): Dependency[] {
  return Array.from({ length: count }, (_, index) => {
    const targetId = `target-${index + 1}`;
    return createMockDependency({
      source_work_item_id: workItemId,
      target_work_item_id: targetId,
      dependency_type: type,
    });
  });
}

/**
 * Create a dependency graph with multiple relationships
 * Returns dependencies representing a complex graph structure
 */
export function createMockDependencyGraph(): Dependency[] {
  return [
    // Epic blocks multiple stories
    createMockBlocksDependency('epic-1', 'story-1'),
    createMockBlocksDependency('epic-1', 'story-2'),
    createMockBlocksDependency('epic-1', 'story-3'),

    // Stories block tasks
    createMockBlocksDependency('story-1', 'task-1'),
    createMockBlocksDependency('story-1', 'task-2'),
    createMockBlocksDependency('story-2', 'task-3'),

    // Some tasks block other tasks
    createMockBlocksDependency('task-1', 'task-4'),
    createMockBlocksDependency('task-2', 'task-4'),
  ];
}

/**
 * Create bidirectional dependencies (A blocks B, B blocked by A)
 */
export function createMockBidirectionalDependencies(workItemId1: string, workItemId2: string): Dependency[] {
  return [
    createMockBlocksDependency(workItemId1, workItemId2),
    createMockBlockedByDependency(workItemId2, workItemId1),
  ];
}

/**
 * Create dependencies with varied types
 */
export function createMockDependenciesWithVariedTypes(sourceId: string, targetIds: string[]): Dependency[] {
  return targetIds.map((targetId, index) => {
    const type = index % 2 === 0 ? DependencyType.Blocks : DependencyType.BlockedBy;
    return createMockDependency({
      source_work_item_id: sourceId,
      target_work_item_id: targetId,
      dependency_type: type,
    });
  });
}
