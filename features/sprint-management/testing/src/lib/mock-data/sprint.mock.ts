/**
 * Sprint Mock Data Generators
 *
 * Provides mock data generators for sprints.
 */

import { Sprint, SprintStatus, SprintWithMetrics } from '@ttrpg-ui/features/sprint-management/models';
import { generateMockId } from './work-item.mock';

/**
 * Create a mock sprint with default values
 */
export function createMockSprint(overrides?: Partial<Sprint>): Sprint {
  const id = generateMockId();
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - 7); // Start 7 days ago
  const endDate = new Date(now);
  endDate.setDate(now.getDate() + 7); // End 7 days from now

  return {
    id,
    name: `Sprint ${id}`,
    description: `Description for sprint ${id}`,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    status: SprintStatus.Active,
    goal: `Complete sprint ${id} goals`,
    created_by: 'user-1',
    created_at: now.toISOString(),
    updated_by: 'user-1',
    updated_at: now.toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock sprint with metrics
 */
export function createMockSprintWithMetrics(overrides?: Partial<SprintWithMetrics>): SprintWithMetrics {
  const sprint = createMockSprint(overrides);

  return {
    ...sprint,
    work_items: overrides?.work_items || [],
    total_items: overrides?.total_items ?? 10,
    completed_items: overrides?.completed_items ?? 5,
    in_progress_items: overrides?.in_progress_items ?? 3,
    blocked_items: overrides?.blocked_items ?? 1,
    total_story_points: overrides?.total_story_points ?? 50,
    completed_story_points: overrides?.completed_story_points ?? 25,
    velocity: overrides?.velocity ?? 25,
  };
}

/**
 * Create multiple mock sprints
 */
export function createMockSprints(count: number, overrides?: Partial<Sprint>): Sprint[] {
  return Array.from({ length: count }, () => createMockSprint(overrides));
}

/**
 * Create a mock sprint in Planning status
 */
export function createMockPlanningSprint(overrides?: Partial<Sprint>): Sprint {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() + 7); // Start in 7 days
  const endDate = new Date(now);
  endDate.setDate(now.getDate() + 21); // End in 21 days

  return createMockSprint({
    status: SprintStatus.Planning,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    ...overrides,
  });
}

/**
 * Create a mock sprint in Active status
 */
export function createMockActiveSprint(overrides?: Partial<Sprint>): Sprint {
  return createMockSprint({
    status: SprintStatus.Active,
    ...overrides,
  });
}

/**
 * Create a mock sprint in Completed status
 */
export function createMockCompletedSprint(overrides?: Partial<Sprint>): Sprint {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - 21); // Started 21 days ago
  const endDate = new Date(now);
  endDate.setDate(now.getDate() - 7); // Ended 7 days ago

  return createMockSprint({
    status: SprintStatus.Completed,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    ...overrides,
  });
}

/**
 * Create a mock sprint in Cancelled status
 */
export function createMockCancelledSprint(overrides?: Partial<Sprint>): Sprint {
  return createMockSprint({
    status: SprintStatus.Cancelled,
    ...overrides,
  });
}

/**
 * Create a collection of sprints with various statuses
 */
export function createMockSprintsWithVariedStatuses(): Sprint[] {
  return [
    createMockPlanningSprint(),
    createMockActiveSprint(),
    createMockCompletedSprint(),
    createMockCancelledSprint(),
  ];
}

/**
 * Create a sprint with specific date range
 */
export function createMockSprintWithDateRange(startDate: Date, endDate: Date, overrides?: Partial<Sprint>): Sprint {
  return createMockSprint({
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    ...overrides,
  });
}

/**
 * Create a sprint that is currently active (dates span current date)
 */
export function createMockCurrentSprint(overrides?: Partial<Sprint>): Sprint {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - 7);
  const endDate = new Date(now);
  endDate.setDate(now.getDate() + 7);

  return createMockSprint({
    status: SprintStatus.Active,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    ...overrides,
  });
}

/**
 * Create a sprint that is in the past
 */
export function createMockPastSprint(overrides?: Partial<Sprint>): Sprint {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - 30);
  const endDate = new Date(now);
  endDate.setDate(now.getDate() - 16);

  return createMockSprint({
    status: SprintStatus.Completed,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    ...overrides,
  });
}

/**
 * Create a sprint that is in the future
 */
export function createMockFutureSprint(overrides?: Partial<Sprint>): Sprint {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() + 14);
  const endDate = new Date(now);
  endDate.setDate(now.getDate() + 28);

  return createMockSprint({
    status: SprintStatus.Planning,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    ...overrides,
  });
}
