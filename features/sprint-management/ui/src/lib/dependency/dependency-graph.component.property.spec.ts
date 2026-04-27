import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  SprintModels,
} from '@ttrpg-ui/features/sprint-management/models';

const { DependencyType } = SprintModels.Dependency;
const { WorkItemType, WorkItemStatus, WorkItemPriority } = SprintModels.WorkItem;
type Dependency = SprintModels.Dependency.Dependency;
type WorkItem = SprintModels.WorkItem.WorkItem;
import { TestBed } from '@angular/core/testing';
import { DependencyGraphComponent, DependencyNode } from './dependency-graph.component';

/**
 * Property-Based Tests for Circular Dependency Detection
 * These tests validate that circular dependencies are correctly detected in any dependency graph
 */
describe('DependencyGraphComponent - Circular Dependency Detection Property Tests', () => {
  let component: DependencyGraphComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DependencyGraphComponent],
    });

    const fixture = TestBed.createComponent(DependencyGraphComponent);
    component = fixture.componentInstance;
  });

  /**
   * Helper function to create a work item
   */
  function createWorkItem(id: string): WorkItem {
    return {
      id,
      title: `Work Item ${id}`,
      description: 'Test work item',
      type: WorkItemType.Story,
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
      created_by: 'test-user',
      created_at: new Date().toISOString(),
      updated_by: 'test-user',
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Helper function to build dependency nodes from work items and dependencies
   */
  function buildDependencyNodes(
    workItems: WorkItem[],
    dependencies: Dependency[]
  ): Map<string, DependencyNode> {
    const nodes = new Map<string, DependencyNode>();

    // Initialize nodes for all work items
    workItems.forEach((workItem) => {
      nodes.set(workItem.id, {
        workItem,
        blocks: [],
        blockedBy: [],
        isInCircularDependency: false,
      });
    });

    // Build relationships
    dependencies.forEach((dep) => {
      const sourceNode = nodes.get(dep.source_work_item_id);
      const targetNode = nodes.get(dep.target_work_item_id);

      if (sourceNode && targetNode) {
        if (dep.dependency_type === DependencyType.Blocks) {
          sourceNode.blocks.push(dep.target_work_item_id);
          targetNode.blockedBy.push(dep.source_work_item_id);
        } else if (dep.dependency_type === DependencyType.BlockedBy) {
          sourceNode.blockedBy.push(dep.target_work_item_id);
          targetNode.blocks.push(dep.source_work_item_id);
        }
      }
    });

    return nodes;
  }

  /**
   * Feature: sprint-management-app, Property 11: Circular Dependency Detection
   * For any dependency graph, circular dependencies should be correctly detected.
   */
  it('should detect simple circular dependencies (A -> B -> A)', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (workItemIdA) => {
          // Create a simple cycle: A blocks B, B blocks A
          const workItemIdB = `${workItemIdA}-b`;
          const workItems = [
            createWorkItem(workItemIdA),
            createWorkItem(workItemIdB),
          ];

          const dependencies: Dependency[] = [
            {
              id: 'dep1',
              source_work_item_id: workItemIdA,
              target_work_item_id: workItemIdB,
              dependency_type: DependencyType.Blocks,
              created_by: 'test',
              created_at: new Date().toISOString(),
            },
            {
              id: 'dep2',
              source_work_item_id: workItemIdB,
              target_work_item_id: workItemIdA,
              dependency_type: DependencyType.Blocks,
              created_by: 'test',
              created_at: new Date().toISOString(),
            },
          ];

          // Build nodes
          const nodes = buildDependencyNodes(workItems, dependencies);

          // Detect circular dependencies
          const circularNodeIds = component.detectCircularDependencies(nodes);

          // Property 1: Both nodes should be marked as circular
          expect(circularNodeIds.size).toBe(2);

          // Property 2: Both specific nodes should be in the circular set
          expect(circularNodeIds.has(workItemIdA)).toBe(true);
          expect(circularNodeIds.has(workItemIdB)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test: Detect longer circular chains (A -> B -> C -> A)
   */
  it('should detect circular dependencies in longer chains', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (workItemIdA) => {
          // Create a cycle: A -> B -> C -> A
          const workItemIdB = `${workItemIdA}-b`;
          const workItemIdC = `${workItemIdA}-c`;

          const workItems = [
            createWorkItem(workItemIdA),
            createWorkItem(workItemIdB),
            createWorkItem(workItemIdC),
          ];

          const dependencies: Dependency[] = [
            {
              id: 'dep1',
              source_work_item_id: workItemIdA,
              target_work_item_id: workItemIdB,
              dependency_type: DependencyType.Blocks,
              created_by: 'test',
              created_at: new Date().toISOString(),
            },
            {
              id: 'dep2',
              source_work_item_id: workItemIdB,
              target_work_item_id: workItemIdC,
              dependency_type: DependencyType.Blocks,
              created_by: 'test',
              created_at: new Date().toISOString(),
            },
            {
              id: 'dep3',
              source_work_item_id: workItemIdC,
              target_work_item_id: workItemIdA,
              dependency_type: DependencyType.Blocks,
              created_by: 'test',
              created_at: new Date().toISOString(),
            },
          ];

          const nodes = buildDependencyNodes(workItems, dependencies);
          const circularNodeIds = component.detectCircularDependencies(nodes);

          // Property 1: All three nodes should be marked as circular
          expect(circularNodeIds.size).toBe(3);

          // Property 2: Each node in the cycle should be marked as circular
          expect(circularNodeIds.has(workItemIdA)).toBe(true);
          expect(circularNodeIds.has(workItemIdB)).toBe(true);
          expect(circularNodeIds.has(workItemIdC)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test: Non-circular dependencies should not be marked as circular
   */
  it('should not detect circular dependencies in acyclic graphs', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (workItemIdA) => {
          // Create a linear chain: A -> B -> C (no cycle)
          const workItemIdB = `${workItemIdA}-b`;
          const workItemIdC = `${workItemIdA}-c`;

          const workItems = [
            createWorkItem(workItemIdA),
            createWorkItem(workItemIdB),
            createWorkItem(workItemIdC),
          ];

          const dependencies: Dependency[] = [
            {
              id: 'dep1',
              source_work_item_id: workItemIdA,
              target_work_item_id: workItemIdB,
              dependency_type: DependencyType.Blocks,
              created_by: 'test',
              created_at: new Date().toISOString(),
            },
            {
              id: 'dep2',
              source_work_item_id: workItemIdB,
              target_work_item_id: workItemIdC,
              dependency_type: DependencyType.Blocks,
              created_by: 'test',
              created_at: new Date().toISOString(),
            },
          ];

          const nodes = buildDependencyNodes(workItems, dependencies);
          const circularNodeIds = component.detectCircularDependencies(nodes);

          // Property 1: No nodes should be marked as circular
          expect(circularNodeIds.size).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test: Multiple independent cycles should all be detected
   */
  it('should detect multiple independent circular dependencies', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (workItemIdA) => {
          // Create two independent cycles:
          // Cycle 1: A -> B -> A
          // Cycle 2: C -> D -> C
          const workItemIdB = `${workItemIdA}-b`;
          const workItemIdC = `${workItemIdA}-c`;
          const workItemIdD = `${workItemIdA}-d`;

          const workItems = [
            createWorkItem(workItemIdA),
            createWorkItem(workItemIdB),
            createWorkItem(workItemIdC),
            createWorkItem(workItemIdD),
          ];

          const dependencies: Dependency[] = [
            // Cycle 1
            {
              id: 'dep1',
              source_work_item_id: workItemIdA,
              target_work_item_id: workItemIdB,
              dependency_type: DependencyType.Blocks,
              created_by: 'test',
              created_at: new Date().toISOString(),
            },
            {
              id: 'dep2',
              source_work_item_id: workItemIdB,
              target_work_item_id: workItemIdA,
              dependency_type: DependencyType.Blocks,
              created_by: 'test',
              created_at: new Date().toISOString(),
            },
            // Cycle 2
            {
              id: 'dep3',
              source_work_item_id: workItemIdC,
              target_work_item_id: workItemIdD,
              dependency_type: DependencyType.Blocks,
              created_by: 'test',
              created_at: new Date().toISOString(),
            },
            {
              id: 'dep4',
              source_work_item_id: workItemIdD,
              target_work_item_id: workItemIdC,
              dependency_type: DependencyType.Blocks,
              created_by: 'test',
              created_at: new Date().toISOString(),
            },
          ];

          const nodes = buildDependencyNodes(workItems, dependencies);
          const circularNodeIds = component.detectCircularDependencies(nodes);

          // Property 1: All four nodes should be marked as circular
          expect(circularNodeIds.size).toBe(4);

          // Property 2: Each node should be marked as circular
          expect(circularNodeIds.has(workItemIdA)).toBe(true);
          expect(circularNodeIds.has(workItemIdB)).toBe(true);
          expect(circularNodeIds.has(workItemIdC)).toBe(true);
          expect(circularNodeIds.has(workItemIdD)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test: Self-referencing dependencies should be detected as circular
   */
  it('should detect self-referencing dependencies as circular', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (workItemId) => {
          // Create a self-reference: A -> A
          const workItems = [createWorkItem(workItemId)];

          const dependencies: Dependency[] = [
            {
              id: 'dep1',
              source_work_item_id: workItemId,
              target_work_item_id: workItemId,
              dependency_type: DependencyType.Blocks,
              created_by: 'test',
              created_at: new Date().toISOString(),
            },
          ];

          const nodes = buildDependencyNodes(workItems, dependencies);
          const circularNodeIds = component.detectCircularDependencies(nodes);

          // Property 1: The node should be marked as circular
          expect(circularNodeIds.size).toBe(1);

          // Property 2: The specific node should be in the circular set
          expect(circularNodeIds.has(workItemId)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Edge case: Empty dependency graph should have no circular dependencies
   */
  it('should handle empty dependency graphs', () => {
    const workItems: WorkItem[] = [];
    const dependencies: Dependency[] = [];

    const nodes = buildDependencyNodes(workItems, dependencies);
    const circularNodeIds = component.detectCircularDependencies(nodes);

    expect(nodes.size).toBe(0);
    expect(circularNodeIds.size).toBe(0);
  });

  /**
   * Edge case: Work items with no dependencies should not be circular
   */
  it('should handle work items with no dependencies', () => {
    fc.assert(
      fc.property(
        fc.array(fc.uuid(), { minLength: 1, maxLength: 10 }),
        (workItemIds) => {
          const workItems = workItemIds.map((id) => createWorkItem(id));
          const dependencies: Dependency[] = [];

          const nodes = buildDependencyNodes(workItems, dependencies);
          const circularNodeIds = component.detectCircularDependencies(nodes);

          // Property 1: No nodes should be circular
          expect(circularNodeIds.size).toBe(0);

          // Property 2: All nodes should exist
          expect(nodes.size).toBe(workItems.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property test: Complex graph with both circular and non-circular parts
   */
  it('should correctly identify circular nodes in mixed graphs', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (workItemIdA) => {
          // Create a mixed graph:
          // Circular: A -> B -> A
          // Non-circular: E -> A (E is not in the cycle)
          const workItemIdB = `${workItemIdA}-b`;
          const workItemIdE = `${workItemIdA}-e`;

          const workItems = [
            createWorkItem(workItemIdA),
            createWorkItem(workItemIdB),
            createWorkItem(workItemIdE),
          ];

          const dependencies: Dependency[] = [
            // Cycle: A -> B -> A
            {
              id: 'dep1',
              source_work_item_id: workItemIdA,
              target_work_item_id: workItemIdB,
              dependency_type: DependencyType.Blocks,
              created_by: 'test',
              created_at: new Date().toISOString(),
            },
            {
              id: 'dep2',
              source_work_item_id: workItemIdB,
              target_work_item_id: workItemIdA,
              dependency_type: DependencyType.Blocks,
              created_by: 'test',
              created_at: new Date().toISOString(),
            },
            // Non-circular: E -> A
            {
              id: 'dep3',
              source_work_item_id: workItemIdE,
              target_work_item_id: workItemIdA,
              dependency_type: DependencyType.Blocks,
              created_by: 'test',
              created_at: new Date().toISOString(),
            },
          ];

          const nodes = buildDependencyNodes(workItems, dependencies);
          const circularNodeIds = component.detectCircularDependencies(nodes);

          // Property 1: Only A and B should be circular (not E)
          expect(circularNodeIds.size).toBe(2);

          // Property 2: A and B should be marked as circular
          expect(circularNodeIds.has(workItemIdA)).toBe(true);
          expect(circularNodeIds.has(workItemIdB)).toBe(true);
          expect(circularNodeIds.has(workItemIdE)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
