export enum AuditAction {
  Created = 'created',
  Updated = 'updated',
  Deleted = 'deleted',
  StatusChanged = 'status_changed',
  Assigned = 'assigned',
  Unassigned = 'unassigned',
  CommentAdded = 'comment_added',
  DependencyAdded = 'dependency_added',
  DependencyRemoved = 'dependency_removed',
}

export interface AuditLog {
  id: string;
  entity_type: 'work_item' | 'sprint' | 'dependency' | 'comment';
  entity_id: string;
  action: AuditAction;
  user_id: string;
  user_name?: string;
  changes: Record<string, any>;
  timestamp: string;
}

export interface AuditLogFilter {
  entity_type?: string;
  entity_id?: string;
  user_id?: string;
  action?: AuditAction;
  start_date?: string;
  end_date?: string;
}
