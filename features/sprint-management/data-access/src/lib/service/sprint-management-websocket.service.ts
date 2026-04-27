import { inject, Injectable, signal, PLATFORM_ID, Injector } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { retry, tap, catchError, EMPTY, timer } from 'rxjs';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';
import { WorkItemStore } from '../+state/work-item.store';
import { SprintStore } from '../+state/sprint.store';
import { CommentStore } from '../+state/comment.store';
import { NotificationStore } from '../+state/notification.store';

const SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN = SprintModels.Service.SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN;
const { NotificationType } = SprintModels.Notification;
type WorkItem = SprintModels.WorkItem.WorkItem;
type Sprint = SprintModels.Sprint.Sprint;
type Comment = SprintModels.Comment.Comment;
type Notification = SprintModels.Notification.Notification;

interface WebSocketMessage {
  type:
    | 'work_item_created'
    | 'work_item_updated'
    | 'work_item_deleted'
    | 'sprint_created'
    | 'sprint_updated'
    | 'sprint_deleted'
    | 'comment_created'
    | 'comment_updated'
    | 'comment_deleted'
    | 'dependency_created'
    | 'dependency_deleted';
  data: WorkItem | Sprint | Comment | Record<string, unknown>;
  user_id: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class SprintManagementWebSocketService {
  private readonly serviceConfig = inject(SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN);
  private readonly injector = inject(Injector);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Lazy-loaded stores to avoid circular dependencies
  private _workItemStore?: InstanceType<typeof WorkItemStore>;
  private _sprintStore?: InstanceType<typeof SprintStore>;
  private _commentStore?: InstanceType<typeof CommentStore>;
  private _notificationStore?: InstanceType<typeof NotificationStore>;

  private get workItemStore(): InstanceType<typeof WorkItemStore> {
    if (!this._workItemStore) {
      this._workItemStore = this.injector.get(WorkItemStore);
    }
    return this._workItemStore;
  }

  private get sprintStore(): InstanceType<typeof SprintStore> {
    if (!this._sprintStore) {
      this._sprintStore = this.injector.get(SprintStore);
    }
    return this._sprintStore;
  }

  private get commentStore(): InstanceType<typeof CommentStore> {
    if (!this._commentStore) {
      this._commentStore = this.injector.get(CommentStore);
    }
    return this._commentStore;
  }

  private get notificationStore(): InstanceType<typeof NotificationStore> {
    if (!this._notificationStore) {
      this._notificationStore = this.injector.get(NotificationStore);
    }
    return this._notificationStore;
  }

  private socket$: WebSocketSubject<WebSocketMessage> | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private readonly baseReconnectDelay = 1000; // 1 second

  public readonly connected = signal<boolean>(false);

  connect(): void {
    if (!this.isBrowser) return;
    if (this.socket$) return;

    if (!this.serviceConfig.initialized()) {
      setTimeout(() => this.connect(), 100);
      return;
    }

    const apiUrl = this.serviceConfig.appConfig().APP_SPRINT_MANAGEMENT__API_URL;
    const wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws';

    this.socket$ = webSocket<WebSocketMessage>({
      url: wsUrl,
      openObserver: {
        next: () => {
          this.connected.set(true);
          this.reconnectAttempts = 0;
        },
      },
      closeObserver: {
        next: () => {
          this.connected.set(false);
        },
      },
    });

    this.socket$
      .pipe(
        tap((message) => this.handleMessage(message)),
        retry({
          delay: (error, retryCount) => {
            this.reconnectAttempts = retryCount;

            if (retryCount > this.maxReconnectAttempts) {
              console.error('WebSocket: Max reconnection attempts reached');
              this.connected.set(false);
              throw error;
            }

            const delay = Math.min(
              this.baseReconnectDelay * Math.pow(2, retryCount - 1),
              30000
            );

            return timer(delay);
          },
        }),
        catchError((error) => {
          console.error('WebSocket: Fatal error', error);
          this.connected.set(false);
          return EMPTY;
        })
      )
      .subscribe();
  }

  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
      this.connected.set(false);
      this.reconnectAttempts = 0;
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'work_item_created':
        this.handleWorkItemCreated(message.data as WorkItem, message.user_id);
        break;

      case 'work_item_updated':
        this.handleWorkItemUpdated(message.data as WorkItem, message.user_id);
        break;

      case 'work_item_deleted':
        this.handleWorkItemDeleted(message.data as { id: string; title?: string }, message.user_id);
        break;

      case 'sprint_created':
        this.handleSprintCreated(message.data as Sprint, message.user_id);
        break;

      case 'sprint_updated':
        this.handleSprintUpdated(message.data as Sprint, message.user_id);
        break;

      case 'sprint_deleted':
        this.handleSprintDeleted(message.data as { id: string; name?: string }, message.user_id);
        break;

      case 'comment_created':
        this.handleCommentCreated(message.data as Comment, message.user_id);
        break;

      case 'comment_updated':
        this.handleCommentUpdated(message.data as Comment, message.user_id);
        break;

      case 'comment_deleted':
        this.handleCommentDeleted(message.data as { id: string; work_item_id: string }, message.user_id);
        break;

      case 'dependency_created':
        this.handleDependencyCreated(message.data as Record<string, unknown>, message.user_id);
        break;

      case 'dependency_deleted':
        this.handleDependencyDeleted(message.data as Record<string, unknown>, message.user_id);
        break;

      default:
        console.warn('WebSocket: Unknown message type', message.type);
    }
  }

  private handleWorkItemCreated(workItem: WorkItem, userId: string): void {
    this.workItemStore.loadWorkItem(workItem.id);

    this.addNotification({
      id: `work_item_created_${workItem.id}_${Date.now()}`,
      type: NotificationType.WorkItemUpdated,
      title: 'New Work Item',
      message: `Work item "${workItem.title}" was created`,
      entity_type: 'work_item',
      entity_id: workItem.id,
      user_id: userId,
      is_read: false,
      created_at: new Date().toISOString(),
    });
  }

  private handleWorkItemUpdated(workItem: WorkItem, userId: string): void {
    this.workItemStore.loadWorkItem(workItem.id);

    this.addNotification({
      id: `work_item_updated_${workItem.id}_${Date.now()}`,
      type: NotificationType.WorkItemUpdated,
      title: 'Work Item Updated',
      message: `Work item "${workItem.title}" was updated`,
      entity_type: 'work_item',
      entity_id: workItem.id,
      user_id: userId,
      is_read: false,
      created_at: new Date().toISOString(),
    });
  }

  private handleWorkItemDeleted(data: { id: string; title?: string }, userId: string): void {
    this.addNotification({
      id: `work_item_deleted_${data.id}_${Date.now()}`,
      type: NotificationType.WorkItemUpdated,
      title: 'Work Item Deleted',
      message: `Work item ${data.title ? `"${data.title}"` : ''} was deleted`,
      entity_type: 'work_item',
      entity_id: data.id,
      user_id: userId,
      is_read: false,
      created_at: new Date().toISOString(),
    });
  }

  private handleSprintCreated(sprint: Sprint, userId: string): void {
    this.sprintStore.loadSprint(sprint.id);

    this.addNotification({
      id: `sprint_created_${sprint.id}_${Date.now()}`,
      type: NotificationType.SprintStarted,
      title: 'New Sprint',
      message: `Sprint "${sprint.name}" was created`,
      entity_type: 'sprint',
      entity_id: sprint.id,
      user_id: userId,
      is_read: false,
      created_at: new Date().toISOString(),
    });
  }

  private handleSprintUpdated(sprint: Sprint, userId: string): void {
    this.sprintStore.loadSprint(sprint.id);

    this.addNotification({
      id: `sprint_updated_${sprint.id}_${Date.now()}`,
      type: NotificationType.SprintStarted,
      title: 'Sprint Updated',
      message: `Sprint "${sprint.name}" was updated`,
      entity_type: 'sprint',
      entity_id: sprint.id,
      user_id: userId,
      is_read: false,
      created_at: new Date().toISOString(),
    });
  }

  private handleSprintDeleted(data: { id: string; name?: string }, userId: string): void {
    this.addNotification({
      id: `sprint_deleted_${data.id}_${Date.now()}`,
      type: NotificationType.SprintCompleted,
      title: 'Sprint Deleted',
      message: `Sprint ${data.name ? `"${data.name}"` : ''} was deleted`,
      entity_type: 'sprint',
      entity_id: data.id,
      user_id: userId,
      is_read: false,
      created_at: new Date().toISOString(),
    });
  }

  private handleCommentCreated(comment: Comment, userId: string): void {
    this.commentStore.loadComments(comment.work_item_id);

    this.addNotification({
      id: `comment_created_${comment.id}_${Date.now()}`,
      type: NotificationType.CommentAdded,
      title: 'New Comment',
      message: 'A new comment was added to a work item',
      entity_type: 'comment',
      entity_id: comment.id,
      user_id: userId,
      is_read: false,
      created_at: new Date().toISOString(),
    });
  }

  private handleCommentUpdated(comment: Comment, _userId: string): void {
    this.commentStore.loadComments(comment.work_item_id);
  }

  private handleCommentDeleted(data: { id: string; work_item_id: string }, _userId: string): void {
    this.commentStore.loadComments(data.work_item_id);
  }

  private handleDependencyCreated(data: Record<string, unknown>, userId: string): void {
    if (data['source_work_item_id'] && typeof data['source_work_item_id'] === 'string') {
      this.workItemStore.loadWorkItem(data['source_work_item_id']);
    }
    if (data['target_work_item_id'] && typeof data['target_work_item_id'] === 'string') {
      this.workItemStore.loadWorkItem(data['target_work_item_id']);
    }

    this.addNotification({
      id: `dependency_created_${data['id']}_${Date.now()}`,
      type: NotificationType.DependencyCreated,
      title: 'Dependency Created',
      message: 'A new dependency was created between work items',
      entity_type: 'dependency',
      entity_id: String(data['id'] || ''),
      user_id: userId,
      is_read: false,
      created_at: new Date().toISOString(),
    });
  }

  private handleDependencyDeleted(data: Record<string, unknown>, _userId: string): void {
    if (data['source_work_item_id'] && typeof data['source_work_item_id'] === 'string') {
      this.workItemStore.loadWorkItem(data['source_work_item_id']);
    }
    if (data['target_work_item_id'] && typeof data['target_work_item_id'] === 'string') {
      this.workItemStore.loadWorkItem(data['target_work_item_id']);
    }
  }

  private addNotification(notification: Notification): void {
    this.notificationStore.addNotification(notification);
  }
}
