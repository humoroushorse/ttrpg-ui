import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import * as fc from 'fast-check';
import { signal } from '@angular/core';
import { OfflineService } from './offline.service';
import { SprintManagementApiService } from './sprint-management-api.service';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN = SprintModels.Service.SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN;
const { QueuedActionType } = SprintModels.Offline;
const { WorkItemType, WorkItemStatus, WorkItemPriority } = SprintModels.WorkItem;
type QueuedAction = SprintModels.Offline.QueuedAction;
type CreateWorkItemRequest = SprintModels.Api.CreateWorkItemRequest;
type UpdateWorkItemRequest = SprintModels.Api.UpdateWorkItemRequest;
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';

/**
 * Property-Based Tests for Offline Service
 * Feature: sprint-management-app
 */
describe('OfflineService - Property Tests', () => {
  let service: OfflineService;
  let httpMock: HttpTestingController;
  let localStorageService: SharedLocalStorageService;
  const baseUrl = '/api/v1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        OfflineService,
        SprintManagementApiService,
        SharedLocalStorageService,
        {
          provide: SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN,
          useValue: {
            appConfig: signal({
              APP_SPRINT_MANAGEMENT__API_BASE_PATH: baseUrl,
              APP_SPRINT_MANAGEMENT__API_URL: 'http://localhost:8003',
            }),
            initialized: signal(true),
          },
        },
        {
          provide: SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN,
          useValue: {
            namespace: 'sprint-management-test',
          },
        },
      ],
    });

    service = TestBed.inject(OfflineService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorageService = TestBed.inject(SharedLocalStorageService);

    // Clear any existing queue
    service.clearQueue();
  });

  /**
   * Property 20: Offline Action Queuing and Sync
   *
   * For any sequence of user actions performed while offline,
   * all actions should be queued and executed in order when connection is restored.
   */
  describe('Property 20: Offline Action Queuing and Sync', () => {
    // Arbitraries for generating test data
    const workItemTypeArb = fc.constantFrom(WorkItemType.Story, WorkItemType.Defect, WorkItemType.Epic);

    const workItemStatusArb = fc.constantFrom(
      WorkItemStatus.Backlog,
      WorkItemStatus.Todo,
      WorkItemStatus.InProgress,
      WorkItemStatus.InReview,
      WorkItemStatus.Done,
    );

    const workItemPriorityArb = fc.constantFrom(
      WorkItemPriority.Low,
      WorkItemPriority.Medium,
      WorkItemPriority.High,
      WorkItemPriority.Critical,
    );

    const createWorkItemRequestArb = fc.record({
      title: fc.string({ minLength: 1, maxLength: 100 }),
      description: fc.string({ maxLength: 500 }),
      type: workItemTypeArb,
      status: workItemStatusArb,
      priority: workItemPriorityArb,
      assignee_id: fc.option(fc.uuid(), { nil: null }),
      sprint_id: fc.option(fc.uuid(), { nil: null }),
      story_points: fc.option(fc.integer({ min: 1, max: 21 }), { nil: null }),
      tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
    }) as fc.Arbitrary<CreateWorkItemRequest>;

    const updateWorkItemRequestArb = fc.record({
      id: fc.uuid(),
      title: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
      description: fc.option(fc.string({ maxLength: 500 })),
      status: fc.option(workItemStatusArb),
      priority: fc.option(workItemPriorityArb),
    }) as fc.Arbitrary<UpdateWorkItemRequest & { id: string }>;

    const actionTypeArb = fc.constantFrom(
      QueuedActionType.CreateWorkItem,
      QueuedActionType.UpdateWorkItem,
      QueuedActionType.DeleteWorkItem,
    );

    it('should queue all actions when offline', () => {
      fc.assert(
        fc.property(
          fc.array(fc.tuple(actionTypeArb, fc.oneof(createWorkItemRequestArb, updateWorkItemRequestArb)), {
            minLength: 1,
            maxLength: 10,
          }),
          (actions) => {
            // Clear queue before test
            service.clearQueue();

            // Queue all actions
            const actionIds: string[] = [];
            actions.forEach(([type, payload]) => {
              const id = service.queueAction(type, payload);
              actionIds.push(id);
            });

            // Verify all actions are queued
            expect(service.queueLength()).toBe(actions.length);
            expect(service.hasPendingActions()).toBe(true);

            // Verify queue contains all actions
            const queuedActions = service.queuedActions();
            expect(queuedActions.length).toBe(actions.length);

            // Verify action IDs are unique
            const uniqueIds = new Set(actionIds);
            expect(uniqueIds.size).toBe(actionIds.length);

            // Verify each action has correct structure
            queuedActions.forEach((action) => {
              expect(action).toHaveProperty('id');
              expect(action).toHaveProperty('type');
              expect(action).toHaveProperty('payload');
              expect(action).toHaveProperty('timestamp');
              expect(action).toHaveProperty('retryCount');
              expect(action).toHaveProperty('maxRetries');
              expect(action.retryCount).toBe(0);
              expect(action.maxRetries).toBeGreaterThan(0);
            });

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should maintain action order in queue', () => {
      fc.assert(
        fc.property(fc.array(createWorkItemRequestArb, { minLength: 2, maxLength: 10 }), (payloads) => {
          // Clear queue before test
          service.clearQueue();

          // Queue actions in order
          const actionIds: string[] = [];
          payloads.forEach((payload) => {
            const id = service.queueAction(QueuedActionType.CreateWorkItem, payload);
            actionIds.push(id);
          });

          // Verify actions are in the same order
          const queuedActions = service.queuedActions();
          queuedActions.forEach((action, index) => {
            expect(action.id).toBe(actionIds[index]);
          });

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should execute all queued actions when syncing', async () => {
      fc.assert(
        fc.asyncProperty(fc.array(createWorkItemRequestArb, { minLength: 1, maxLength: 5 }), async (payloads) => {
          // Clear queue before test
          service.clearQueue();

          // Queue all actions
          payloads.forEach((payload) => {
            service.queueAction(QueuedActionType.CreateWorkItem, payload);
          });

          const initialQueueLength = service.queueLength();
          expect(initialQueueLength).toBe(payloads.length);

          // Trigger sync
          const syncPromise = service.syncQueuedActions();

          // Mock API responses for all actions
          payloads.forEach((payload, index) => {
            const req = httpMock.expectOne(`${baseUrl}/workitems`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toMatchObject(payload);

            // Respond with success
            req.flush({
              id: `work-item-${index}`,
              ...payload,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: 'test-user',
              updated_by: 'test-user',
            });
          });

          // Wait for sync to complete
          await syncPromise;

          // Verify queue is empty after successful sync
          expect(service.queueLength()).toBe(0);
          expect(service.hasPendingActions()).toBe(false);

          return true;
        }),
        { numRuns: 50 }, // Reduced runs for async tests
      );
    });

    it('should preserve failed actions in queue for retry', async () => {
      fc.assert(
        fc.asyncProperty(fc.array(createWorkItemRequestArb, { minLength: 2, maxLength: 5 }), async (payloads) => {
          // Clear queue before test
          service.clearQueue();

          // Queue all actions
          payloads.forEach((payload) => {
            service.queueAction(QueuedActionType.CreateWorkItem, payload);
          });

          const _initialQueueLength = service.queueLength();

          // Trigger sync
          const syncPromise = service.syncQueuedActions();

          // Mock API responses - make some fail
          payloads.forEach((payload, index) => {
            const req = httpMock.expectOne(`${baseUrl}/workitems`);

            if (index % 2 === 0) {
              // Success for even indices
              req.flush({
                id: `work-item-${index}`,
                ...payload,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                created_by: 'test-user',
                updated_by: 'test-user',
              });
            } else {
              // Failure for odd indices
              req.flush({ error: 'Server error' }, { status: 500, statusText: 'Server Error' });
            }
          });

          // Wait for sync to complete
          await syncPromise;

          // Calculate expected failed actions
          const expectedFailedCount = Math.ceil(payloads.length / 2);

          // Verify failed actions remain in queue
          expect(service.queueLength()).toBe(expectedFailedCount);

          // Verify retry count is incremented for failed actions
          const queuedActions = service.queuedActions();
          queuedActions.forEach((action) => {
            expect(action.retryCount).toBeGreaterThan(0);
            expect(action.retryCount).toBeLessThanOrEqual(action.maxRetries);
          });

          return true;
        }),
        { numRuns: 30 }, // Reduced runs for async tests with failures
      );
    });

    it('should discard actions that exceed max retries', async () => {
      fc.assert(
        fc.asyncProperty(createWorkItemRequestArb, async (payload) => {
          // Clear queue before test
          service.clearQueue();

          // Queue action
          service.queueAction(QueuedActionType.CreateWorkItem, payload);

          // Manually set retry count to max - 1
          const queuedActions = service.queuedActions();
          const action = queuedActions[0];
          const modifiedAction: QueuedAction = {
            ...action,
            retryCount: action.maxRetries - 1,
          };

          // Replace action in queue
          service.clearQueue();
          service['queuedActionsSignal'].set([modifiedAction]);

          // Trigger sync
          const syncPromise = service.syncQueuedActions();

          // Mock API failure
          const req = httpMock.expectOne(`${baseUrl}/workitems`);
          req.flush({ error: 'Server error' }, { status: 500, statusText: 'Server Error' });

          // Wait for sync to complete
          await syncPromise;

          // Verify action is discarded (queue is empty)
          expect(service.queueLength()).toBe(0);

          return true;
        }),
        { numRuns: 30 }, // Reduced runs for async tests
      );
    });

    it('should preserve queue in local storage', () => {
      fc.assert(
        fc.property(fc.array(createWorkItemRequestArb, { minLength: 1, maxLength: 5 }), (payloads) => {
          // Clear queue before test
          service.clearQueue();

          // Queue all actions
          payloads.forEach((payload) => {
            service.queueAction(QueuedActionType.CreateWorkItem, payload);
          });

          const queueLength = service.queueLength();

          // The effect that saves to storage runs asynchronously
          // We need to flush the effects by accessing the signal
          TestBed.flushEffects();

          // Verify queue is saved to local storage
          const storedQueue = localStorageService.get<QueuedAction[]>('sprint-management-offline-queue');
          expect(storedQueue).toBeTruthy();
          expect(storedQueue?.length).toBe(queueLength);

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should handle empty queue gracefully', async () => {
      // Clear queue - flush effects to ensure any pending storage writes are settled
      service.clearQueue();
      TestBed.flushEffects();

      expect(service.queueLength()).toBe(0);
      expect(service.hasPendingActions()).toBe(false);

      // Sync should complete without errors when queue is empty
      await expect(service.syncQueuedActions()).resolves.toBeUndefined();
    });

    it('should allow removing specific actions from queue', () => {
      fc.assert(
        fc.property(fc.array(createWorkItemRequestArb, { minLength: 3, maxLength: 10 }), (payloads) => {
          // Clear queue before test
          service.clearQueue();

          // Queue all actions
          const actionIds: string[] = [];
          payloads.forEach((payload) => {
            const id = service.queueAction(QueuedActionType.CreateWorkItem, payload);
            actionIds.push(id);
          });

          const initialLength = service.queueLength();

          // Remove a random action
          const indexToRemove = Math.floor(Math.random() * actionIds.length);
          const idToRemove = actionIds[indexToRemove];
          service.removeAction(idToRemove);

          // Verify action is removed
          expect(service.queueLength()).toBe(initialLength - 1);

          const queuedActions = service.queuedActions();
          const removedAction = queuedActions.find((a) => a.id === idToRemove);
          expect(removedAction).toBeUndefined();

          return true;
        }),
        { numRuns: 100 },
      );
    });
  });
});
