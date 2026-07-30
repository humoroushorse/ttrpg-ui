import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { DependencyType } = SprintModels.Dependency;
type Dependency = SprintModels.Dependency.Dependency;
type DependencyType = SprintModels.Dependency.DependencyType;
type WorkItem = SprintModels.WorkItem.WorkItem;

/**
 * Dependency Graph Node
 * Represents a work item in the dependency graph
 */
export interface DependencyNode {
  workItem: WorkItem;
  blocks: string[]; // IDs of work items this blocks
  blockedBy: string[]; // IDs of work items this is blocked by
  isInCircularDependency: boolean;
}

/**
 * Dependency Graph Component
 *
 * Visual representation of dependencies showing blocks/blocked-by relationships
 * and highlighting circular dependencies.
 *
 */
@Component({
  selector: 'lib-dependency-graph',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule, MatChipsModule],
  templateUrl: './dependency-graph.component.html',
  styleUrl: './dependency-graph.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DependencyGraphComponent {
  dependencies = input.required<Dependency[]>();
  workItems = input.required<WorkItem[]>();
  currentWorkItemId = input<string | null>(null);
  loading = input<boolean>(false);

  workItemClick = output<WorkItem>();
  removeDependency = output<Dependency>();

  dependencyNodes = computed(() => {
    const workItems = this.workItems();
    const dependencies = this.dependencies();
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

    // Detect circular dependencies
    const circularNodes = this.detectCircularDependencies(nodes);
    circularNodes.forEach((nodeId) => {
      const node = nodes.get(nodeId);
      if (node) {
        node.isInCircularDependency = true;
      }
    });

    return Array.from(nodes.values());
  });

  blockingNodes = computed(() => {
    return this.dependencyNodes().filter((node) => node.blocks.length > 0);
  });

  blockedNodes = computed(() => {
    return this.dependencyNodes().filter((node) => node.blockedBy.length > 0);
  });

  circularDependencyNodes = computed(() => {
    return this.dependencyNodes().filter((node) => node.isInCircularDependency);
  });

  detectCircularDependencies(nodes: Map<string, DependencyNode>): Set<string> {
    const circularNodes = new Set<string>();
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string, path: string[]): boolean => {
      if (recursionStack.has(nodeId)) {
        // Found a cycle - mark all nodes in the cycle
        const cycleStart = path.indexOf(nodeId);
        for (let i = cycleStart; i < path.length; i++) {
          circularNodes.add(path[i]);
        }
        circularNodes.add(nodeId);
        return true;
      }

      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);
      path.push(nodeId);

      const node = nodes.get(nodeId);
      if (node) {
        // Check all nodes this one blocks
        for (const blockedId of node.blocks) {
          if (dfs(blockedId, [...path])) {
            circularNodes.add(nodeId);
          }
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    // Run DFS from each node
    nodes.forEach((_, nodeId) => {
      if (!visited.has(nodeId)) {
        dfs(nodeId, []);
      }
    });

    return circularNodes;
  }

  isCurrentWorkItem(node: DependencyNode): boolean {
    const currentId = this.currentWorkItemId();
    return currentId !== null && node.workItem.id === currentId;
  }

  onWorkItemClick(node: DependencyNode): void {
    this.workItemClick.emit(node.workItem);
  }

  onRemoveDependency(dependency: Dependency): void {
    this.removeDependency.emit(dependency);
  }

  getWorkItemById(id: string): WorkItem | undefined {
    return this.workItems().find((wi) => wi.id === id);
  }

  getDependency(sourceId: string, targetId: string): Dependency | undefined {
    return this.dependencies().find(
      (dep) => dep.source_work_item_id === sourceId && dep.target_work_item_id === targetId,
    );
  }

  getNodeClass(node: DependencyNode): string {
    const classes: string[] = ['dependency-node'];

    if (this.isCurrentWorkItem(node)) {
      classes.push('current');
    }

    if (node.isInCircularDependency) {
      classes.push('circular');
    } else if (node.blockedBy.length > 0) {
      classes.push('blocked');
    } else if (node.blocks.length > 0) {
      classes.push('blocking');
    }

    return classes.join(' ');
  }

  getNodeIcon(node: DependencyNode): string {
    if (node.isInCircularDependency) {
      return 'warning';
    } else if (node.blockedBy.length > 0) {
      return 'block';
    } else if (node.blocks.length > 0) {
      return 'lock';
    }
    return 'check_circle';
  }

  getNodeTooltip(node: DependencyNode): string {
    if (node.isInCircularDependency) {
      return 'This work item is part of a circular dependency';
    } else if (node.blockedBy.length > 0) {
      return `Blocked by ${node.blockedBy.length} item(s)`;
    } else if (node.blocks.length > 0) {
      return `Blocks ${node.blocks.length} item(s)`;
    }
    return 'No dependencies';
  }
}
