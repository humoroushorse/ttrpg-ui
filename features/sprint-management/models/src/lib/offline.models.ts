export enum QueuedActionType {
  CreateWorkItem = 'CREATE_WORK_ITEM',
  UpdateWorkItem = 'UPDATE_WORK_ITEM',
  DeleteWorkItem = 'DELETE_WORK_ITEM',
  CreateSprint = 'CREATE_SPRINT',
  UpdateSprint = 'UPDATE_SPRINT',
  DeleteSprint = 'DELETE_SPRINT',
  CreateComment = 'CREATE_COMMENT',
  UpdateComment = 'UPDATE_COMMENT',
  DeleteComment = 'DELETE_COMMENT',
  CreateDependency = 'CREATE_DEPENDENCY',
  DeleteDependency = 'DELETE_DEPENDENCY',
}

export interface QueuedAction {
  id: string;
  type: QueuedActionType;
  payload: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface OfflineState {
  isOnline: boolean;
  queuedActions: QueuedAction[];
  lastSyncAttempt: number | null;
  syncInProgress: boolean;
}
