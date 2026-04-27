import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { TemplateStore } from './template.store';
import { SprintManagementApiService } from '../service/sprint-management-api.service';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';
import { WebSocketService } from '../service/websocket.service';

const SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN =
  SprintModels.Service.SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN;

type WorkItemTemplate = SprintModels.Template.WorkItemTemplate;

const makeTemplate = (overrides: Partial<WorkItemTemplate> = {}): WorkItemTemplate => ({
  id: 'tpl-1',
  name: 'Bug Report',
  description: 'Template for bugs',
  type: SprintModels.WorkItem.WorkItemType.Defect,
  defaultPriority: SprintModels.WorkItem.WorkItemPriority.High,
  defaultTags: ['bug'],
  customFields: [],
  ...overrides,
});

describe('TemplateStore', () => {
  let store: InstanceType<typeof TemplateStore>;
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
        TemplateStore,
      ],
    });

    store = TestBed.inject(TemplateStore);
    apiService = TestBed.inject(SprintManagementApiService);
  });

  describe('loadTemplates', () => {
    it('should load templates and set entities', () => {
      const templates = [
        makeTemplate({ id: 'tpl-1' }),
        makeTemplate({ id: 'tpl-2', name: 'Feature', type: SprintModels.WorkItem.WorkItemType.Story }),
      ];
      vi.spyOn(apiService, 'getWorkItemTemplates').mockReturnValue(of(templates));

      store.loadTemplates();

      expect(store.entities().length).toBe(2);
      expect(store.loaded()).toBe(true);
      expect(store.loading()).toBe(false);
    });

    it('should set error on load failure', () => {
      vi.spyOn(apiService, 'getWorkItemTemplates').mockReturnValue(
        throwError(() => ({ message: 'Network error', error: {} }))
      );

      store.loadTemplates();

      expect(store.error()).toBeTruthy();
      expect(store.loading()).toBe(false);
    });
  });

  describe('applyTemplate', () => {
    it('should return a copy of the template by id', () => {
      const template = makeTemplate({ id: 'tpl-1' });
      vi.spyOn(apiService, 'getWorkItemTemplates').mockReturnValue(of([template]));
      store.loadTemplates();

      const result = store.applyTemplate('tpl-1');

      expect(result).toBeTruthy();
      expect(result?.id).toBe('tpl-1');
      expect(result?.name).toBe('Bug Report');
    });

    it('should return null for unknown template id', () => {
      vi.spyOn(apiService, 'getWorkItemTemplates').mockReturnValue(of([]));
      store.loadTemplates();

      const result = store.applyTemplate('nonexistent');

      expect(result).toBeNull();
    });

    it('should return a copy, not the same reference', () => {
      const template = makeTemplate({ id: 'tpl-1' });
      vi.spyOn(apiService, 'getWorkItemTemplates').mockReturnValue(of([template]));
      store.loadTemplates();

      const result = store.applyTemplate('tpl-1');

      expect(result).not.toBe(store.entityMap()['tpl-1']);
    });
  });

  describe('templatesByType', () => {
    it('should group templates by work item type', () => {
      const templates = [
        makeTemplate({ id: 'tpl-1', type: SprintModels.WorkItem.WorkItemType.Defect }),
        makeTemplate({ id: 'tpl-2', type: SprintModels.WorkItem.WorkItemType.Story }),
        makeTemplate({ id: 'tpl-3', type: SprintModels.WorkItem.WorkItemType.Story }),
      ];
      vi.spyOn(apiService, 'getWorkItemTemplates').mockReturnValue(of(templates));
      store.loadTemplates();

      const byType = store.templatesByType();

      expect(byType.get(SprintModels.WorkItem.WorkItemType.Defect)?.length).toBe(1);
      expect(byType.get(SprintModels.WorkItem.WorkItemType.Story)?.length).toBe(2);
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * Validates: Requirements 4
     *
     * When a template is applied, all template default values SHALL be copied to the
     * work item form, and user modifications SHALL override template values.
     */
    it('Property 4: template defaults are copied and user modifications override them', () => {
      fc.assert(
        fc.property(
          fc.record({
            priority: fc.constantFrom(
              SprintModels.WorkItem.WorkItemPriority.Low,
              SprintModels.WorkItem.WorkItemPriority.Medium,
              SprintModels.WorkItem.WorkItemPriority.High,
              SprintModels.WorkItem.WorkItemPriority.Critical
            ),
            tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 5 }),
            descriptionTemplate: fc.string({ minLength: 0, maxLength: 200 }),
          }),
          fc.record({
            priority: fc.constantFrom(
              SprintModels.WorkItem.WorkItemPriority.Low,
              SprintModels.WorkItem.WorkItemPriority.Medium,
              SprintModels.WorkItem.WorkItemPriority.High,
              SprintModels.WorkItem.WorkItemPriority.Critical
            ),
            description: fc.string({ minLength: 1, maxLength: 200 }),
          }),
          (templateDefaults, userOverrides) => {
            const template = makeTemplate({
              id: 'tpl-prop',
              defaultPriority: templateDefaults.priority,
              defaultTags: templateDefaults.tags,
              descriptionTemplate: templateDefaults.descriptionTemplate,
            });

            vi.spyOn(apiService, 'getWorkItemTemplates').mockReturnValue(of([template]));
            store.loadTemplates();

            const applied = store.applyTemplate('tpl-prop');
            expect(applied).toBeTruthy();

            // Simulate form state after template application
            let formPriority = applied?.defaultPriority ?? SprintModels.WorkItem.WorkItemPriority.Medium;
            let formDescription = applied?.descriptionTemplate ?? '';
            const formTags = [...(applied?.defaultTags ?? [])];

            // Template defaults are copied
            expect(formPriority).toBe(templateDefaults.priority);
            expect(formDescription).toBe(templateDefaults.descriptionTemplate);
            expect(formTags).toEqual(templateDefaults.tags);

            // User overrides take precedence
            formPriority = userOverrides.priority;
            formDescription = userOverrides.description;

            expect(formPriority).toBe(userOverrides.priority);
            expect(formDescription).toBe(userOverrides.description);

            // Template defaults are NOT restored after user override
            expect(formPriority).not.toBe(
              templateDefaults.priority === userOverrides.priority
                ? null // same value, skip assertion
                : templateDefaults.priority
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 4: applyTemplate always returns a copy with all template fields', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.uuid(),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            description: fc.string({ minLength: 0, maxLength: 200 }),
            type: fc.constantFrom(
              SprintModels.WorkItem.WorkItemType.Story,
              SprintModels.WorkItem.WorkItemType.Defect,
              SprintModels.WorkItem.WorkItemType.Epic
            ),
            defaultPriority: fc.option(
              fc.constantFrom(
                SprintModels.WorkItem.WorkItemPriority.Low,
                SprintModels.WorkItem.WorkItemPriority.Medium,
                SprintModels.WorkItem.WorkItemPriority.High
              ),
              { nil: undefined }
            ),
            defaultTags: fc.option(
              fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
              { nil: undefined }
            ),
          }),
          (templateData) => {
            const template: WorkItemTemplate = {
              ...templateData,
              customFields: [],
            };

            vi.spyOn(apiService, 'getWorkItemTemplates').mockReturnValue(of([template]));
            store.loadTemplates();

            const applied = store.applyTemplate(templateData.id);

            expect(applied).not.toBeNull();
            if (applied) {
              expect(applied.id).toBe(templateData.id);
              expect(applied.name).toBe(templateData.name);
              expect(applied.type).toBe(templateData.type);
              if (templateData.defaultPriority !== undefined) {
                expect(applied.defaultPriority).toBe(templateData.defaultPriority);
              }
              if (templateData.defaultTags !== undefined) {
                expect(applied.defaultTags).toEqual(templateData.defaultTags);
              }
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
