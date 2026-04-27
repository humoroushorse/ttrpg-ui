import { FilterModel } from './filter.models';
import { SortModel } from './sort.models';
import { WorkItemType, WorkItemStatus, WorkItemPriority } from './work-item.models';
import { SprintStatus } from './sprint.models';

export interface PaginatedRequest {
  page: number;
  page_size: number;
  filters?: FilterModel[];
  sort?: SortModel[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CreateWorkItemRequest {
  title: string;
  description: string;
  type: WorkItemType;
  status: WorkItemStatus;
  priority: WorkItemPriority;
  project_id: string; // Required
  assignee_id?: string;
  sprint_id?: string;
  parent_id?: string;
  story_points?: number;
  estimated_hours?: number;
  tags?: string[];
  custom_fields?: Record<string, any>;
}

export interface UpdateWorkItemRequest extends Partial<CreateWorkItemRequest> {
  id: string;
}

export interface CreateSprintRequest {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  goal?: string;
}

export interface UpdateSprintRequest extends Partial<CreateSprintRequest> {
  id: string;
  status?: SprintStatus;
}

export interface BulkUpdateRequest {
  work_item_ids: string[];
  updates: Partial<UpdateWorkItemRequest>;
}

export interface SearchWorkItemsRequest extends PaginatedRequest {
  query: string;
  search_fields: string[];
}
