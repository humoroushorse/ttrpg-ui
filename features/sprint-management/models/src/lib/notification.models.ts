export enum NotificationType {
  WorkItemAssigned = 'work_item_assigned',
  WorkItemUpdated = 'work_item_updated',
  WorkItemCompleted = 'work_item_completed',
  CommentAdded = 'comment_added',
  DependencyCreated = 'dependency_created',
  SprintStarted = 'sprint_started',
  SprintCompleted = 'sprint_completed',
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  entity_type: 'work_item' | 'sprint' | 'comment' | 'dependency';
  entity_id: string;
  user_id: string;
  is_read: boolean;
  created_at: string;
}
