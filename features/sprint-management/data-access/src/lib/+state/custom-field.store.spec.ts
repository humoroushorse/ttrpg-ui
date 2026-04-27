import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { CustomFieldStore } from './custom-field.store';
import { SprintManagementApiService } from '../service/sprint-management-api.service';
import { WebSocketService } from '../service/websocket.service';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN = SprintModels.Service.SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN;
const { CustomFieldType } = SprintModels.CustomField;
type CustomFieldDefinition = SprintModels.CustomField.CustomFieldDefinition;

const mockFields: CustomFieldDefinition[] = [
  { key: 'story_category', label: 'Story Category', type: CustomFieldType.Select, options: ['Frontend', 'Backend'] },
  { key: 'complexity_score', label: 'Complexity Score', type: CustomFieldType.Number, placeholder: '1-10' },
  { key: 'due_date_override', label: 'Due Date Override', type: CustomFieldType.Date },
  {
    key: 'affected_components',
    label: 'Affected Components',
    type: CustomFieldType.MultiSelect,
    options: ['Auth', 'API'],
  },
  { key: 'needs_review', label: 'Needs Design Review', type: CustomFieldType.Checkbox, defaultValue: false },
  { key: 'external_ticket', label: 'External Ticket ID', type: CustomFieldType.Text, placeholder: 'e.g. JIRA-1234' },
];

describe('CustomFieldStore', () => {
  let store: InstanceType<typeof CustomFieldStore>;
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
        CustomFieldStore,
      ],
    });

    store = TestBed.inject(CustomFieldStore);
    apiService = TestBed.inject(SprintManagementApiService);
  });

  describe('loadCustomFields', () => {
    it('should load fields and set loaded state', () => {
      vi.spyOn(apiService, 'getCustomFieldDefinitions').mockReturnValue(of(mockFields));

      store.loadCustomFields();

      expect(store.fields().length).toBe(6);
      expect(store.loaded()).toBe(true);
      expect(store.loading()).toBe(false);
    });

    it('should index entities by key', () => {
      vi.spyOn(apiService, 'getCustomFieldDefinitions').mockReturnValue(of(mockFields));

      store.loadCustomFields();

      const fields = store.fields();
      expect(fields.find((f) => f.key === 'story_category')).toBeDefined();
      expect(fields.find((f) => f.key === 'complexity_score')).toBeDefined();
      expect(fields.find((f) => f.key === 'external_ticket')).toBeDefined();
    });

    it('should set error on load failure', () => {
      vi.spyOn(apiService, 'getCustomFieldDefinitions').mockReturnValue(
        throwError(() => ({ message: 'Network error', error: {} })),
      );

      store.loadCustomFields();

      expect(store.error()).toBeTruthy();
      expect(store.loading()).toBe(false);
    });
  });

  describe('fieldsByType computed signal', () => {
    it('should group fields by type', () => {
      vi.spyOn(apiService, 'getCustomFieldDefinitions').mockReturnValue(of(mockFields));

      store.loadCustomFields();

      const byType = store.fieldsByType();
      expect(byType.get(CustomFieldType.Select)?.length).toBe(1);
      expect(byType.get(CustomFieldType.Number)?.length).toBe(1);
      expect(byType.get(CustomFieldType.Date)?.length).toBe(1);
      expect(byType.get(CustomFieldType.MultiSelect)?.length).toBe(1);
      expect(byType.get(CustomFieldType.Checkbox)?.length).toBe(1);
      expect(byType.get(CustomFieldType.Text)?.length).toBe(1);
    });

    it('should return empty arrays for types with no fields', () => {
      vi.spyOn(apiService, 'getCustomFieldDefinitions').mockReturnValue(of([]));

      store.loadCustomFields();

      const byType = store.fieldsByType();
      for (const type of Object.values(CustomFieldType)) {
        expect(byType.get(type)).toEqual([]);
      }
    });

    it('should return empty map before loading', () => {
      const byType = store.fieldsByType();
      expect(byType).toBeDefined();
      for (const type of Object.values(CustomFieldType)) {
        expect(byType.get(type)).toEqual([]);
      }
    });
  });
});
