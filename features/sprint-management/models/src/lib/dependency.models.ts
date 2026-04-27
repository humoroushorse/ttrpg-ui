import { WorkItem } from './work-item.models';

export enum DependencyType {
  Blocks = 'blocks',
  BlockedBy = 'blocked_by',
}

export interface Dependency {
  id: string;
  source_work_item_id: string;
  target_work_item_id: string;
  dependency_type: DependencyType;
  created_by: string;
  created_at: string;
}

export interface DependencyWithWorkItems extends Dependency {
  source_work_item?: WorkItem;
  target_work_item?: WorkItem;
}
