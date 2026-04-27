import { Injectable, inject, signal, computed, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { fromEvent, merge, of } from 'rxjs';
import { map, startWith, distinctUntilChanged } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';
import { SprintManagementApiService } from './sprint-management-api.service';

const OFFLINE_QUEUE_KEY = 'sprint-management-offline-queue';
const MAX_RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

const { QueuedActionType } = SprintModels.Offline;
type QueuedAction = SprintModels.Offline.QueuedAction;
type QueuedActionType = SprintModels.Offline.QueuedActionType;
type OfflineState = SprintModels.Offline.OfflineState;
type CreateWorkItemRequest = SprintModels.Api.CreateWorkItemRequest;
type UpdateWorkItemRequest = SprintModels.Api.UpdateWorkItemRequest;
type CreateSprintRequest = SprintModels.Api.CreateSprintRequest;
type UpdateSprintRequest = SprintModels.Api.UpdateSprintRequest;

@Injectable({
  providedIn: 'root',
})
export class OfflineService {
  private readonly localStorage = inject(SharedLocalStorageService);
  private readonly apiService = inject(SprintManagementApiService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Track online/offline status using browser events
  private readonly onlineEvents$ = this.isBrowser
    ? merge(
        fromEvent(window, 'online').pipe(map(() => true)),
        fromEvent(window, 'offline').pipe(map(() => false)),
        of(navigator.onLine),
      ).pipe(startWith(navigator.onLine), distinctUntilChanged())
    : of(true).pipe(startWith(true));

  public readonly isOnline = toSignal(this.onlineEvents$, { initialValue: navigator.onLine });

  private readonly queuedActionsSignal = signal<QueuedAction[]>(this.loadQueueFromStorage());

  // Sync state
  private readonly syncInProgressSignal = signal<boolean>(false);
  private readonly lastSyncAttemptSignal = signal<number | null>(null);

  public readonly queuedActions = computed(() => this.queuedActionsSignal());
  public readonly queueLength = computed(() => this.queuedActionsSignal().length);
  public readonly hasPendingActions = computed(() => this.queuedActionsSignal().length > 0);
  public readonly syncInProgress = computed(() => this.syncInProgressSignal());
  public readonly lastSyncAttempt = computed(() => this.lastSyncAttemptSignal());

  public readonly offlineState = computed<OfflineState>(() => ({
    isOnline: this.isOnline() ?? true,
    queuedActions: this.queuedActionsSignal(),
    lastSyncAttempt: this.lastSyncAttemptSignal(),
    syncInProgress: this.syncInProgressSignal(),
  }));

  constructor() {
    // Auto-sync when coming back online
    effect(() => {
      const online = this.isOnline();
      if (online && this.hasPendingActions() && !this.syncInProgress()) {
        this.syncQueuedActions();
      }
    });

    // Persist queue to storage whenever it changes
    effect(() => {
      const queue = this.queuedActionsSignal();
      this.saveQueueToStorage(queue);
    });
  }

  queueAction(type: QueuedActionType, payload: any): string {
    const action: QueuedAction = {
      id: this.generateActionId(),
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: MAX_RETRY_ATTEMPTS,
    };

    this.queuedActionsSignal.update((queue) => [...queue, action]);
    return action.id;
  }

  async syncQueuedActions(): Promise<void> {
    if (!this.isOnline() || this.syncInProgress() || !this.hasPendingActions()) {
      return;
    }

    this.syncInProgressSignal.set(true);
    this.lastSyncAttemptSignal.set(Date.now());

    const queue = [...this.queuedActionsSignal()];
    const successfulActions: string[] = [];
    const failedActions: QueuedAction[] = [];

    for (const action of queue) {
      try {
        await this.executeAction(action);
        successfulActions.push(action.id);
      } catch (error) {
        console.error(`Failed to execute queued action ${action.id}:`, error);

        // Increment retry count
        const updatedAction = {
          ...action,
          retryCount: action.retryCount + 1,
        };

        // Keep in queue if under max retries
        if (updatedAction.retryCount < updatedAction.maxRetries) {
          failedActions.push(updatedAction);
        } else {
          console.error(`Action ${action.id} exceeded max retries, discarding`);
        }
      }
    }

    // Update queue: remove successful actions, keep failed ones for retry
    this.queuedActionsSignal.update((currentQueue) =>
      currentQueue
        .filter((action) => !successfulActions.includes(action.id))
        .map((action) => {
          const failed = failedActions.find((f) => f.id === action.id);
          return failed || action;
        }),
    );

    this.syncInProgressSignal.set(false);
  }

  private async executeAction(action: QueuedAction): Promise<void> {
    const backoffDelay = INITIAL_RETRY_DELAY * Math.pow(2, action.retryCount);

    if (action.retryCount > 0) {
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }

    switch (action.type) {
      case QueuedActionType.CreateWorkItem:
        await this.apiService.createWorkItem(action.payload as CreateWorkItemRequest).toPromise();
        break;

      case QueuedActionType.UpdateWorkItem: {
        const { id: workItemId, ...updateData } = action.payload;
        await this.apiService.updateWorkItem(workItemId, updateData as UpdateWorkItemRequest).toPromise();
        break;
      }

      case QueuedActionType.DeleteWorkItem:
        await this.apiService.deleteWorkItem(action.payload.id).toPromise();
        break;

      case QueuedActionType.CreateSprint:
        await this.apiService.createSprint(action.payload as CreateSprintRequest).toPromise();
        break;

      case QueuedActionType.UpdateSprint: {
        const { id: sprintId, ...sprintUpdateData } = action.payload;
        await this.apiService.updateSprint(sprintId, sprintUpdateData as UpdateSprintRequest).toPromise();
        break;
      }

      case QueuedActionType.DeleteSprint:
        await this.apiService.deleteSprint(action.payload.id).toPromise();
        break;

      case QueuedActionType.CreateComment:
        // TODO: Fix - needs workItemId in payload
        // await this.apiService.createComment(action.payload).toPromise();
        console.warn('CreateComment offline action not yet implemented');
        break;

      case QueuedActionType.UpdateComment:
        // TODO: Fix - needs workItemId in payload
        // const { id: commentId, ...commentUpdateData } = action.payload;
        // await this.apiService.updateComment(commentId, commentUpdateData).toPromise();
        console.warn('UpdateComment offline action not yet implemented');
        break;

      case QueuedActionType.DeleteComment:
        // TODO: Fix - needs workItemId in payload
        // await this.apiService.deleteComment(action.payload.id).toPromise();
        console.warn('DeleteComment offline action not yet implemented');
        break;

      case QueuedActionType.CreateDependency:
        // TODO: Fix - needs workItemId and targetId in payload
        // await this.apiService.createDependency(action.payload).toPromise();
        console.warn('CreateDependency offline action not yet implemented');
        break;

      case QueuedActionType.DeleteDependency:
        // TODO: Fix - needs workItemId in payload
        // await this.apiService.deleteDependency(action.payload.id).toPromise();
        console.warn('DeleteDependency offline action not yet implemented');
        break;

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  clearQueue(): void {
    this.queuedActionsSignal.set([]);
    this.saveQueueToStorage([]);
  }

  removeAction(actionId: string): void {
    this.queuedActionsSignal.update((queue) => queue.filter((action) => action.id !== actionId));
  }

  private loadQueueFromStorage(): QueuedAction[] {
    try {
      const stored = this.localStorage.get<QueuedAction[]>(OFFLINE_QUEUE_KEY);
      return stored || [];
    } catch (error) {
      console.error('Failed to load offline queue from storage:', error);
      return [];
    }
  }

  private saveQueueToStorage(queue: QueuedAction[]): void {
    try {
      this.localStorage.set(OFFLINE_QUEUE_KEY, queue);
    } catch (error) {
      console.error('Failed to save offline queue to storage:', error);
    }
  }

  private generateActionId(): string {
    return `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
