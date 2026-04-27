/**
 * Work Item Mock Data Generators
 *
 * Provides mock data generators for work items and related entities.
 */

import {
  WorkItem,
  WorkItemType,
  WorkItemStatus,
  WorkItemPriority,
  WorkItemWithRelations,
  User,
} from '@ttrpg-ui/features/sprint-management/models';

let mockIdCounter = 1;

/**
 * Generate a unique mock ID
 */
export function generateMockId(): string {
  return `mock-${mockIdCounter++}`;
}

/**
 * Reset the mock ID counter (useful for tests)
 */
export function resetMockIdCounter(): void {
  mockIdCounter = 1;
}

/**
 * Create a mock user
 */
export function createMockUser(overrides?: Partial<User>): User {
  const id = generateMockId();
  return {
    id,
    username: `user${id}`,
    email: `user${id}@example.com`,
    first_name: `First${id}`,
    last_name: `Last${id}`,
    avatar_url: `https://i.pravatar.cc/150?u=${id}`,
    ...overrides,
  };
}

/**
 * Create a mock work item with default values
 */
export function createMockWorkItem(overrides?: Partial<WorkItem>): WorkItem {
  const id = generateMockId();
  const now = new Date().toISOString();

  return {
    id,
    title: `Work Item ${id}`,
    description: `Description for work item ${id}`,
    type: WorkItemType.Task,
    status: WorkItemStatus.Todo,
    priority: WorkItemPriority.Medium,
    assignee_id: null,
    sprint_id: null,
    parent_id: null,
    story_points: null,
    estimated_hours: null,
    actual_hours: null,
    tags: [],
    custom_fields: {},
    created_by: 'user-1',
    created_at: now,
    updated_by: 'user-1',
    updated_at: now,
    ...overrides,
  };
}

/**
 * Create a mock work item with relations
 */
export function createMockWorkItemWithRelations(
  overrides?: Partial<WorkItemWithRelations>
): WorkItemWithRelations {
  const workItem = createMockWorkItem(overrides);

  return {
    ...workItem,
    assignee: overrides?.assignee,
    sprint: overrides?.sprint,
    parent: overrides?.parent,
    children: overrides?.children || [],
    dependencies: overrides?.dependencies || [],
    comments: overrides?.comments || [],
    attachments: overrides?.attachments || [],
    watchers: overrides?.watchers || [],
    history: overrides?.history || [],
  };
}

/**
 * Create multiple mock work items
 */
export function createMockWorkItems(count: number, overrides?: Partial<WorkItem>): WorkItem[] {
  return Array.from({ length: count }, () => createMockWorkItem(overrides));
}

/**
 * Create a mock work item of type Story
 */
export function createMockStory(overrides?: Partial<WorkItem>): WorkItem {
  return createMockWorkItem({
    type: WorkItemType.Story,
    story_points: 5,
    ...overrides,
  });
}

/**
 * Create a mock work item of type Task
 */
export function createMockTask(overrides?: Partial<WorkItem>): WorkItem {
  return createMockWorkItem({
    type: WorkItemType.Task,
    estimated_hours: 8,
    ...overrides,
  });
}

/**
 * Create a mock work item of type Bug
 */
export function createMockBug(overrides?: Partial<WorkItem>): WorkItem {
  return createMockWorkItem({
    type: WorkItemType.Bug,
    priority: WorkItemPriority.High,
    ...overrides,
  });
}

/**
 * Create a mock work item of type Epic
 */
export function createMockEpic(overrides?: Partial<WorkItem>): WorkItem {
  return createMockWorkItem({
    type: WorkItemType.Epic,
    story_points: 50,
    ...overrides,
  });
}

/**
 * Create a mock work item in Backlog status
 */
export function createMockBacklogWorkItem(overrides?: Partial<WorkItem>): WorkItem {
  return createMockWorkItem({
    status: WorkItemStatus.Backlog,
    ...overrides,
  });
}

/**
 * Create a mock work item in In Progress status
 */
export function createMockInProgressWorkItem(overrides?: Partial<WorkItem>): WorkItem {
  return createMockWorkItem({
    status: WorkItemStatus.InProgress,
    ...overrides,
  });
}

/**
 * Create a mock work item in Done status
 */
export function createMockDoneWorkItem(overrides?: Partial<WorkItem>): WorkItem {
  return createMockWorkItem({
    status: WorkItemStatus.Done,
    ...overrides,
  });
}

/**
 * Create a collection of work items with various statuses
 */
export function createMockWorkItemsWithVariedStatuses(): WorkItem[] {
  return [
    createMockWorkItem({ status: WorkItemStatus.Backlog }),
    createMockWorkItem({ status: WorkItemStatus.Todo }),
    createMockWorkItem({ status: WorkItemStatus.InProgress }),
    createMockWorkItem({ status: WorkItemStatus.InReview }),
    createMockWorkItem({ status: WorkItemStatus.Done }),
  ];
}

/**
 * Create a collection of work items with various types
 */
export function createMockWorkItemsWithVariedTypes(): WorkItem[] {
  return [
    createMockStory(),
    createMockTask(),
    createMockBug(),
    createMockEpic(),
  ];
}

/**
 * Create a collection of work items with various priorities
 */
export function createMockWorkItemsWithVariedPriorities(): WorkItem[] {
  return [
    createMockWorkItem({ priority: WorkItemPriority.Low }),
    createMockWorkItem({ priority: WorkItemPriority.Medium }),
    createMockWorkItem({ priority: WorkItemPriority.High }),
    createMockWorkItem({ priority: WorkItemPriority.Critical }),
  ];
}
