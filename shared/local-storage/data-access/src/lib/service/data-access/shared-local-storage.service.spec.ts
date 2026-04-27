import { TestBed } from '@angular/core/testing';
import * as fc from 'fast-check';
import { describe, it, expect, beforeEach } from 'vitest';

import { SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/local-storage/models';
import { SharedLocalStorageService } from './shared-local-storage.service';

describe('SharedLocalStorageService', () => {
  let service: SharedLocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN,
          useValue: { namespace: 'test' },
        },
      ],
    });
    service = TestBed.inject(SharedLocalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

describe('SharedLocalStorageService - SSR Compatibility', () => {
  /**
   * Feature: sprint-management-app, Property 16: SSR Storage Operations No Errors
   * For any storage operation (get, set, remove, clearNamespace), executing in a server context
   * (no localStorage available) should not throw errors.
   * Validates: Requirements 21.7
   */
  it('should not throw errors when executing storage operations in server context', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }), // key
        fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.object(), fc.array(fc.string())), // value
        (key, value) => {
          // Create service with server platform (no localStorage)
          TestBed.resetTestingModule();
          TestBed.configureTestingModule({
            providers: [
              {
                provide: SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN,
                useValue: { namespace: 'test-ssr' },
              },
              {
                provide: 'PLATFORM_ID',
                useValue: 'server', // Simulate server platform
              },
            ],
          });

          const serverService = TestBed.inject(SharedLocalStorageService);

          // Property: All operations should execute without throwing errors
          expect(() => serverService.set(key, value)).not.toThrow();
          expect(() => serverService.get(key)).not.toThrow();
          expect(() => serverService.getAll()).not.toThrow();
          expect(() => serverService.hasKey(key)).not.toThrow();
          expect(() => serverService.remove(key)).not.toThrow();
          expect(() => serverService.clearNamespace()).not.toThrow();
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: sprint-management-app, Property 17: SSR Storage Behavior Consistency
   * For any sequence of storage operations, the resulting state should be equivalent
   * whether executed in browser context (with localStorage) or server context (with in-memory fallback).
   * Validates: Requirements 21.8
   */
  it('should maintain consistent behavior between browser and server contexts', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            operation: fc.constantFrom('set', 'get', 'remove', 'hasKey'),
            key: fc.string({ minLength: 1, maxLength: 20 }),
            value: fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.object({ maxDepth: 2 })),
          }),
          { minLength: 1, maxLength: 20 },
        ),
        (operations) => {
          // Setup browser context service
          TestBed.resetTestingModule();
          TestBed.configureTestingModule({
            providers: [
              {
                provide: SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN,
                useValue: { namespace: 'test-browser' },
              },
              {
                provide: 'PLATFORM_ID',
                useValue: 'browser',
              },
            ],
          });
          const browserService = TestBed.inject(SharedLocalStorageService);
          browserService.clearNamespace(); // Start clean

          // Setup server context service
          TestBed.resetTestingModule();
          TestBed.configureTestingModule({
            providers: [
              {
                provide: SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN,
                useValue: { namespace: 'test-server' },
              },
              {
                provide: 'PLATFORM_ID',
                useValue: 'server',
              },
            ],
          });
          const serverService = TestBed.inject(SharedLocalStorageService);
          serverService.clearNamespace(); // Start clean

          // Execute the same sequence of operations on both services
          const browserResults: unknown[] = [];
          const serverResults: unknown[] = [];

          for (const op of operations) {
            switch (op.operation) {
              case 'set':
                browserService.set(op.key, op.value);
                serverService.set(op.key, op.value);
                browserResults.push(undefined);
                serverResults.push(undefined);
                break;
              case 'get':
                browserResults.push(browserService.get(op.key));
                serverResults.push(serverService.get(op.key));
                break;
              case 'remove':
                browserService.remove(op.key);
                serverService.remove(op.key);
                browserResults.push(undefined);
                serverResults.push(undefined);
                break;
              case 'hasKey':
                browserResults.push(browserService.hasKey(op.key));
                serverResults.push(serverService.hasKey(op.key));
                break;
            }
          }

          // Property: Results should be equivalent
          expect(browserResults).toEqual(serverResults);

          // Property: Final state should be equivalent
          const browserFinalState = browserService.getAll();
          const serverFinalState = serverService.getAll();
          expect(browserFinalState).toEqual(serverFinalState);
        },
      ),
      { numRuns: 100 },
    );
  });
});
