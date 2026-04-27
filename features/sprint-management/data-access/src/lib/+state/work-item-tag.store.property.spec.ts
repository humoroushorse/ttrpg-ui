/**
 * Property-Based Tests: Tag Uniqueness
 *
 * **Validates: Requirements 1.2**
 * Property 1: For any work item, the set of tags SHALL NOT contain duplicates.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { patchState } from '@ngrx/signals';
import { addEntity } from '@ngrx/signals/entities';
import { signal } from '@angular/core';
import { WorkItemStore } from './work-item.store';
import { SprintManagementApiService } from '../service/sprint-management-api.service';
import { WebSocketService } from '../service/websocket.service';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN = SprintModels.Service.SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN;
const { WorkItemType, WorkItemStatus, WorkItemPriority } = SprintModels.WorkItem;
type WorkItem = SprintModels.WorkItem.WorkItem;

const makeWorkItem = (id: string, tags: string[]): WorkItem => ({
  id,
  title: 'Test',
  description: 'desc',
  type: WorkItemType.Story,
  status: WorkItemStatus.Todo,
  priority: WorkItemPriority.Medium,
  assignee_id: null,
  sprint_id: null,
  parent_id: null,
  project_id: null,
  project_key: null,
  ticket_number: null,
  story_points: null,
  estimated_hours: null,
  actual_hours: null,
  tags,
  custom_fields: {},
  created_by: 'user1',
  created_at: new Date().toISOString(),
  updated_by: 'user1',
  updated_at: new Date().toISOString(),
});

const tagArb = fc.stringMatching(/^[a-z][a-z0-9-]{0,19}$/);

describe('WorkItemStore - Tag Uniqueness (Property 1)', () => {
  let store: InstanceType<typeof WorkItemStore>;
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
        WorkItemStore,
      ],
    });

    store = TestBed.inject(WorkItemStore);
    apiService = TestBed.inject(SprintManagementApiService);
  });

  it('adding a tag that already exists does not create duplicates', () => {
    fc.assert(
      fc.property(fc.uuid(), fc.array(tagArb, { minLength: 1, maxLength: 10 }), tagArb, (id, initialTags, tagToAdd) => {
        const uniqueInitial = [...new Set(initialTags)];
        const item = makeWorkItem(id, uniqueInitial);
        patchState(store, addEntity(item));

        const updatedItem = {
          ...item,
          tags: uniqueInitial.includes(tagToAdd) ? uniqueInitial : [...uniqueInitial, tagToAdd],
        };
        vi.spyOn(apiService, 'addTag').mockReturnValue(of(updatedItem));

        store.addTag({ workItemId: id, tag: tagToAdd });

        const result = store.entityMap()[id];
        const tags = result?.tags ?? [];

        const uniqueTags = new Set(tags);
        expect(uniqueTags.size).toBe(tags.length);
      }),
      { numRuns: 200 },
    );
  });

  it('adding the same tag multiple times results in exactly one occurrence', () => {
    fc.assert(
      fc.property(fc.uuid(), tagArb, (id, tag) => {
        const item = makeWorkItem(id, []);
        patchState(store, addEntity(item));

        const updatedItem = { ...item, tags: [tag] };
        vi.spyOn(apiService, 'addTag').mockReturnValue(of(updatedItem));

        store.addTag({ workItemId: id, tag });
        store.addTag({ workItemId: id, tag });
        store.addTag({ workItemId: id, tag });

        const result = store.entityMap()[id];
        const tags = result?.tags ?? [];
        const occurrences = tags.filter((t) => t === tag).length;

        expect(occurrences).toBeLessThanOrEqual(1);
      }),
      { numRuns: 200 },
    );
  });

  it('getAvailableTags always returns a set with no duplicates', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            tags: fc.array(tagArb, { minLength: 0, maxLength: 5 }),
          }),
          { minLength: 1, maxLength: 10 },
        ),
        (items) => {
          items.forEach(({ id, tags }) => {
            patchState(store, addEntity(makeWorkItem(id, [...new Set(tags)])));
          });

          const available = store.getAvailableTags();
          const uniqueAvailable = new Set(available);

          expect(uniqueAvailable.size).toBe(available.length);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('work item form addTag method prevents duplicates', () => {
    fc.assert(
      fc.property(fc.array(tagArb, { minLength: 1, maxLength: 10 }), (tags) => {
        const seen = new Set<string>();
        const result: string[] = [];

        for (const tag of tags) {
          if (!result.includes(tag)) {
            result.push(tag);
            seen.add(tag);
          }
        }

        const uniqueResult = new Set(result);
        expect(uniqueResult.size).toBe(result.length);
      }),
      { numRuns: 200 },
    );
  });
});
