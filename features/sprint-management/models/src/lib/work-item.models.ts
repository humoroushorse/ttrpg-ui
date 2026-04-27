export enum WorkItemType {
  Epic = 'epic',
  Story = 'story',
  Defect = 'defect',
}

export enum WorkItemStatus {
  Backlog = 'backlog',
  Todo = 'todo',
  InProgress = 'in_progress',
  InReview = 'in_review',
  Done = 'done',
}

export enum WorkItemPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical',
}

export interface WorkItem {
  id: string;
  title: string;
  description: string;
  type: WorkItemType;
  status: WorkItemStatus;
  priority: WorkItemPriority;
  assignee_id: string | null;
  sprint_id: string | null;
  parent_id: string | null;
  project_id: string | null;
  project_key?: string | null;
  ticket_number: number | null;
  story_points: number | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  tags: string[];
  custom_fields: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
}

export interface WorkItemWithRelations extends WorkItem {
  assignee?: User;
  sprint?: Sprint;
  parent?: WorkItem;
  children?: WorkItem[];
  dependencies?: Dependency[];
  comments?: Comment[];
  attachments?: Attachment[];
  watchers?: User[];
  history?: AuditLog[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
}

export interface Sprint {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  goal: string | null;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
}

export interface Dependency {
  id: string;
  source_work_item_id: string;
  target_work_item_id: string;
  dependency_type: string;
  created_by: string;
  created_at: string;
}

export interface Comment {
  id: string;
  work_item_id: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  work_item_id: string;
  filename: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  uploaded_at: string;
}

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  user_id: string;
  changes: Record<string, any>;
  timestamp: string;
}
