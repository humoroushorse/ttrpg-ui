import { WorkItem } from './work-item.models';

export enum LinkType {
  RelatedTo = 'related_to',
  DuplicateOf = 'duplicate_of',
  Blocks = 'blocks',
  BlockedBy = 'blocked_by',
}

export interface WorkItemLink {
  id: string;
  source_work_item_id: string;
  target_work_item_id: string;
  link_type: LinkType;
  created_by: string;
  created_at: string;
}

export interface WorkItemLinkWithWorkItems extends WorkItemLink {
  source_work_item?: WorkItem;
  target_work_item?: WorkItem;
}

export interface CreateWorkItemLinkRequest {
  source_work_item_id: string;
  target_work_item_id: string;
  link_type: LinkType;
}
