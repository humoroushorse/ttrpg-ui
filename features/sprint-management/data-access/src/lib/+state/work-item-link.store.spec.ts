import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { patchState } from '@ngrx/signals';
import { addEntity, setAllEntities } from '@ngrx/signals/entities';
import { signal } from '@angular/core';
import { WorkItemLinkStore } from './work-item-link.store';
import { SprintManagementApiService } from '../service/sprint-management-api.service';
import { WebSocketService } from '../service/websocket.service';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN =
  SprintModels.Service.SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN;
const { LinkType } = SprintModels.WorkItemLink;
type WorkItemLink = SprintModels.WorkItemLink.WorkItemLink;

const makeLink = (overrides: Partial<WorkItemLink> = {}): WorkItemLink => ({
  id: 'link-1',
  source_work_item_id: 'wi-a',
  target_work_item_id: 'wi-b',
  link_type: LinkType.RelatedTo,
  created_by: 'user-1',
  created_at: new Date().toISOString(),
  ...overrides,
});

describe('WorkItemLinkStore', () => {
  let store: InstanceType<typeof WorkItemLinkStore>;
  let apiService: SprintManagementApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN,
          useValue: {
            appConfig: signal({
              APP_SPRINT_MANAGEMENT__API_BASE_PATH: '/api/v1',
              APP_SPRINT_MANAGEMENT__API_URL: 'http://localhost:8003',
            }),
            initialized: signal(true),
          },
        },
        WebSocketService,
        SprintManagementApiService,
        WorkItemLinkStore,
      ],
    });

    store = TestBed.inject(WorkItemLinkStore);
    apiService = TestBed.inject(SprintManagementApiService);
  });

  // ============================================================================
  // loadLinks
  // ============================================================================

  describe('loadLinks', () => {
    it('should load links and set state', () => {
      const links = [
        makeLink({ id: 'l-1', link_type: LinkType.Blocks }),
        makeLink({ id: 'l-2', link_type: LinkType.RelatedTo }),
      ];
      vi.spyOn(apiService, 'getWorkItemLinks').mockReturnValue(of(links));

      store.loadLinks('wi-a');

      expect(store.entities().length).toBe(2);
      expect(store.loaded()).toBe(true);
      expect(store.loading()).toBe(false);
    });

    it('should set error on load failure', () => {
      vi.spyOn(apiService, 'getWorkItemLinks').mockReturnValue(
        throwError(() => ({ message: 'Network error', error: {} }))
      );

      store.loadLinks('wi-a');

      expect(store.error()).toBeTruthy();
      expect(store.loading()).toBe(false);
    });
  });

  // ============================================================================
  // createLink
  // ============================================================================

  describe('createLink', () => {
    it('should optimistically add a link before API completes', () => {
      vi.spyOn(apiService, 'createWorkItemLink').mockReturnValue(
        of(makeLink({ id: 'l-real' }))
      );

      store.createLink({
        source_work_item_id: 'wi-a',
        target_work_item_id: 'wi-b',
        link_type: LinkType.RelatedTo,
      });

      expect(store.entities().length).toBeGreaterThanOrEqual(1);
    });

    it('should rollback optimistic add on API error', async () => {
      vi.spyOn(apiService, 'createWorkItemLink').mockReturnValue(
        throwError(() => ({ message: 'error', error: {} }))
      );

      store.createLink({
        source_work_item_id: 'wi-a',
        target_work_item_id: 'wi-b',
        link_type: LinkType.RelatedTo,
      });

      await new Promise((r) => setTimeout(r, 0));

      const tempLinks = store.entities().filter((l) => l.id.startsWith('temp-'));
      expect(tempLinks.length).toBe(0);
    });

    it('should prevent creating a blocks link that would cause a cycle', () => {
      patchState(
        store,
        setAllEntities([
          makeLink({ id: 'l-1', source_work_item_id: 'wi-a', target_work_item_id: 'wi-b', link_type: LinkType.Blocks }),
          makeLink({ id: 'l-2', source_work_item_id: 'wi-b', target_work_item_id: 'wi-c', link_type: LinkType.Blocks }),
        ])
      );

      const spy = vi.spyOn(apiService, 'createWorkItemLink');

      store.createLink({
        source_work_item_id: 'wi-c',
        target_work_item_id: 'wi-a',
        link_type: LinkType.Blocks,
      });

      expect(spy).not.toHaveBeenCalled();
    });

    it('should allow non-blocks links even if they would form a cycle', () => {
      patchState(
        store,
        setAllEntities([
          makeLink({ id: 'l-1', source_work_item_id: 'wi-a', target_work_item_id: 'wi-b', link_type: LinkType.Blocks }),
        ])
      );

      vi.spyOn(apiService, 'createWorkItemLink').mockReturnValue(
        of(makeLink({ id: 'l-new', source_work_item_id: 'wi-b', target_work_item_id: 'wi-a', link_type: LinkType.RelatedTo }))
      );

      store.createLink({
        source_work_item_id: 'wi-b',
        target_work_item_id: 'wi-a',
        link_type: LinkType.RelatedTo,
      });

      expect(apiService.createWorkItemLink).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // deleteLink
  // ============================================================================

  describe('deleteLink', () => {
    it('should optimistically remove a link', () => {
      const link = makeLink({ id: 'l-1' });
      patchState(store, addEntity(link));
      expect(store.entities().length).toBe(1);

      vi.spyOn(apiService, 'deleteWorkItemLink').mockReturnValue(of(void 0));

      store.deleteLink('l-1');

      expect(store.entities().length).toBe(0);
    });

    it('should rollback on delete error', async () => {
      const link = makeLink({ id: 'l-1' });
      patchState(store, addEntity(link));

      vi.spyOn(apiService, 'deleteWorkItemLink').mockReturnValue(
        throwError(() => ({ message: 'error', error: {} }))
      );

      store.deleteLink('l-1');

      await new Promise((r) => setTimeout(r, 0));

      expect(store.entities().length).toBe(1);
    });
  });

  // ============================================================================
  // Computed signals
  // ============================================================================

  describe('computed signals', () => {
    beforeEach(() => {
      patchState(
        store,
        setAllEntities([
          makeLink({ id: 'l-1', link_type: LinkType.Blocks }),
          makeLink({ id: 'l-2', link_type: LinkType.BlockedBy }),
          makeLink({ id: 'l-3', link_type: LinkType.RelatedTo }),
          makeLink({ id: 'l-4', link_type: LinkType.DuplicateOf }),
          makeLink({ id: 'l-5', link_type: LinkType.RelatedTo }),
        ])
      );
    });

    it('blocksLinks should return only Blocks links', () => {
      expect(store.blocksLinks().length).toBe(1);
      expect(store.blocksLinks()[0].link_type).toBe(LinkType.Blocks);
    });

    it('blockedByLinks should return only BlockedBy links', () => {
      expect(store.blockedByLinks().length).toBe(1);
      expect(store.blockedByLinks()[0].link_type).toBe(LinkType.BlockedBy);
    });

    it('relatedToLinks should return only RelatedTo links', () => {
      expect(store.relatedToLinks().length).toBe(2);
    });

    it('duplicateOfLinks should return only DuplicateOf links', () => {
      expect(store.duplicateOfLinks().length).toBe(1);
    });

    it('linksByType should group all links by type', () => {
      const grouped = store.linksByType();
      expect(grouped[LinkType.Blocks].length).toBe(1);
      expect(grouped[LinkType.BlockedBy].length).toBe(1);
      expect(grouped[LinkType.RelatedTo].length).toBe(2);
      expect(grouped[LinkType.DuplicateOf].length).toBe(1);
    });
  });

  // ============================================================================
  // clearLinks
  // ============================================================================

  describe('clearLinks', () => {
    it('should clear all links and reset currentWorkItemId', () => {
      vi.spyOn(apiService, 'getWorkItemLinks').mockReturnValue(
        of([makeLink({ id: 'l-1' })])
      );
      store.loadLinks('wi-a');
      expect(store.entities().length).toBe(1);

      store.clearLinks();

      expect(store.entities().length).toBe(0);
    });
  });

  // ============================================================================
  // Property-Based Tests — Property 6: No circular blocks
  // ============================================================================

  describe('Property-Based Tests', () => {
    it('**Validates: Requirements 7.6** — no circular blocks: if A blocks B and B blocks C, C cannot block A', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 2, maxLength: 4 }), { minLength: 3, maxLength: 6 }),
          (nodeIds) => {
            const uniqueIds = [...new Set(nodeIds)];
            if (uniqueIds.length < 3) return;

            const [a, b, c] = uniqueIds;

            const existingLinks: WorkItemLink[] = [
              makeLink({ id: 'l-ab', source_work_item_id: a, target_work_item_id: b, link_type: LinkType.Blocks }),
              makeLink({ id: 'l-bc', source_work_item_id: b, target_work_item_id: c, link_type: LinkType.Blocks }),
            ];

            patchState(store, setAllEntities(existingLinks));

            const spy = vi.spyOn(apiService, 'createWorkItemLink');

            store.createLink({
              source_work_item_id: c,
              target_work_item_id: a,
              link_type: LinkType.Blocks,
            });

            expect(spy).not.toHaveBeenCalled();

            spy.mockRestore();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('**Validates: Requirements 7.6** — non-cyclic blocks are always allowed', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 2, maxLength: 4 }),
          fc.string({ minLength: 2, maxLength: 4 }),
          (sourceId, targetId) => {
            fc.pre(sourceId !== targetId);

            patchState(store, setAllEntities([] as WorkItemLink[]));

            vi.spyOn(apiService, 'createWorkItemLink').mockReturnValue(
              of(makeLink({ id: `l-${Date.now()}`, source_work_item_id: sourceId, target_work_item_id: targetId, link_type: LinkType.Blocks }))
            );

            store.createLink({
              source_work_item_id: sourceId,
              target_work_item_id: targetId,
              link_type: LinkType.Blocks,
            });

            expect(apiService.createWorkItemLink).toHaveBeenCalled();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('**Validates: Requirements 7.6** — longer chains are also detected as cycles', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.string({ minLength: 2, maxLength: 4 }),
            { minLength: 4, maxLength: 8 }
          ),
          (nodeIds) => {
            const uniqueIds = [...new Set(nodeIds)];
            if (uniqueIds.length < 4) return;

            const chain = uniqueIds.slice(0, 4);
            const chainLinks: WorkItemLink[] = chain.slice(0, -1).map((id, i) =>
              makeLink({
                id: `l-chain-${i}`,
                source_work_item_id: id,
                target_work_item_id: chain[i + 1],
                link_type: LinkType.Blocks,
              })
            );

            patchState(store, setAllEntities(chainLinks));

            const spy = vi.spyOn(apiService, 'createWorkItemLink');

            store.createLink({
              source_work_item_id: chain[chain.length - 1],
              target_work_item_id: chain[0],
              link_type: LinkType.Blocks,
            });

            expect(spy).not.toHaveBeenCalled();

            spy.mockRestore();
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
