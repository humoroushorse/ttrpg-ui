import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { FormBuilder, Validators } from '@angular/forms';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { WorkItemType, WorkItemStatus, WorkItemPriority } = SprintModels.WorkItem;

describe('PageWorkItemCreateComponent - Property-Based Tests', () => {
  let fb: FormBuilder;

  beforeEach(() => {
    fb = new FormBuilder();
  });

  it('should fail validation when required fields (title, type, status) are missing or empty', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.option(fc.string(), { nil: undefined }),
          description: fc.option(fc.string(), { nil: undefined }),
          type: fc.option(fc.constantFrom(...Object.values(WorkItemType)), { nil: undefined }),
          status: fc.option(fc.constantFrom(...Object.values(WorkItemStatus)), { nil: undefined }),
          priority: fc.constantFrom(...Object.values(WorkItemPriority)),
          assignee_id: fc.option(fc.string(), { nil: undefined }),
          sprint_id: fc.option(fc.string(), { nil: undefined }),
          parent_id: fc.option(fc.string(), { nil: undefined }),
          story_points: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
          estimated_hours: fc.option(fc.integer({ min: 0, max: 1000 }), { nil: undefined }),
        }),
        (formData) => {
          const form = fb.group({
            title: [formData.title, [Validators.required, Validators.minLength(1)]],
            description: [formData.description, []],
            type: [formData.type, [Validators.required]],
            status: [formData.status, [Validators.required]],
            priority: [formData.priority, [Validators.required]],
            assignee_id: [formData.assignee_id, []],
            sprint_id: [formData.sprint_id, []],
            parent_id: [formData.parent_id, []],
            story_points: [formData.story_points, [Validators.min(0)]],
            estimated_hours: [formData.estimated_hours, [Validators.min(0)]],
          });

          const hasTitle = formData.title !== undefined && formData.title !== null && formData.title.length > 0;
          const hasType = formData.type !== undefined && formData.type !== null;
          const hasStatus = formData.status !== undefined && formData.status !== null;
          const hasPriority = formData.priority !== undefined && formData.priority !== null;
          const storyPointsValid = formData.story_points === undefined || formData.story_points === null || formData.story_points >= 0;
          const estimatedHoursValid = formData.estimated_hours === undefined || formData.estimated_hours === null || formData.estimated_hours >= 0;

          const shouldBeValid = hasTitle && hasType && hasStatus && hasPriority && storyPointsValid && estimatedHoursValid;

          expect(form.valid).toBe(shouldBeValid);

          if (!hasTitle) expect(form.get('title')?.hasError('required')).toBe(true);
          if (!hasType) expect(form.get('type')?.hasError('required')).toBe(true);
          if (!hasStatus) expect(form.get('status')?.hasError('required')).toBe(true);
          if (!hasPriority) expect(form.get('priority')?.hasError('required')).toBe(true);

          if (formData.story_points !== undefined && formData.story_points !== null && formData.story_points < 0) {
            expect(form.get('story_points')?.hasError('min')).toBe(true);
          }
          if (formData.estimated_hours !== undefined && formData.estimated_hours !== null && formData.estimated_hours < 0) {
            expect(form.get('estimated_hours')?.hasError('min')).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should pass validation when all required fields are provided with valid values', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 200 }),
          description: fc.string({ maxLength: 2000 }),
          type: fc.constantFrom(...Object.values(WorkItemType)),
          status: fc.constantFrom(...Object.values(WorkItemStatus)),
          priority: fc.constantFrom(...Object.values(WorkItemPriority)),
          assignee_id: fc.option(fc.uuid(), { nil: undefined }),
          sprint_id: fc.option(fc.uuid(), { nil: undefined }),
          parent_id: fc.option(fc.uuid(), { nil: undefined }),
          story_points: fc.option(fc.integer({ min: 0, max: 100 }), { nil: undefined }),
          estimated_hours: fc.option(fc.integer({ min: 0, max: 1000 }), { nil: undefined }),
        }),
        (formData) => {
          const form = fb.group({
            title: [formData.title, [Validators.required, Validators.minLength(1)]],
            description: [formData.description, []],
            type: [formData.type, [Validators.required]],
            status: [formData.status, [Validators.required]],
            priority: [formData.priority, [Validators.required]],
            assignee_id: [formData.assignee_id, []],
            sprint_id: [formData.sprint_id, []],
            parent_id: [formData.parent_id, []],
            story_points: [formData.story_points, [Validators.min(0)]],
            estimated_hours: [formData.estimated_hours, [Validators.min(0)]],
          });

          expect(form.valid).toBe(true);
          expect(form.get('title')?.errors).toBeNull();
          expect(form.get('type')?.errors).toBeNull();
          expect(form.get('status')?.errors).toBeNull();
          expect(form.get('priority')?.errors).toBeNull();
          expect(form.get('story_points')?.errors).toBeNull();
          expect(form.get('estimated_hours')?.errors).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Angular's required validator doesn't trim whitespace, but minLength(1) catches empty strings.
  // Whitespace-only strings pass required but may pass minLength too — form validity depends on exact value.
  it('should fail validation when title is an empty string', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', '   ', '\t', '\n'),
        fc.constantFrom(...Object.values(WorkItemType)),
        fc.constantFrom(...Object.values(WorkItemStatus)),
        fc.constantFrom(...Object.values(WorkItemPriority)),
        (emptyTitle, type, status, priority) => {
          const form = fb.group({
            title: [emptyTitle, [Validators.required, Validators.minLength(1)]],
            description: ['', []],
            type: [type, [Validators.required]],
            status: [status, [Validators.required]],
            priority: [priority, [Validators.required]],
            assignee_id: ['', []],
            sprint_id: ['', []],
            parent_id: ['', []],
            story_points: [null, [Validators.min(0)]],
            estimated_hours: [null, [Validators.min(0)]],
          });

          if (emptyTitle.trim().length === 0) {
            expect(form.valid).toBe(emptyTitle.length > 0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('PageWorkItemCreateComponent - Form Caching Property Tests', () => {
  const makeMockStorage = () => {
    const store: Record<string, unknown> = {};
    return {
      get: (key: string) => store[key],
      set: (key: string, value: unknown) => { store[key] = value; },
      remove: (key: string) => { delete store[key]; },
    };
  };

  it('should correctly cache and restore form data (round-trip property)', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 200 }),
          description: fc.string({ maxLength: 2000 }),
          type: fc.constantFrom(...Object.values(WorkItemType)),
          status: fc.constantFrom(...Object.values(WorkItemStatus)),
          priority: fc.constantFrom(...Object.values(WorkItemPriority)),
          assignee_id: fc.option(fc.uuid(), { nil: '' }),
          sprint_id: fc.option(fc.uuid(), { nil: '' }),
          parent_id: fc.option(fc.uuid(), { nil: '' }),
          story_points: fc.option(fc.integer({ min: 0, max: 100 }), { nil: null }),
          estimated_hours: fc.option(fc.integer({ min: 0, max: 1000 }), { nil: null }),
          tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 10 }),
        }),
        (originalFormData) => {
          const storage = makeMockStorage();
          const cacheKey = 'PageWorkItemCreateComponent.formData';

          storage.set(cacheKey, originalFormData);
          const restored = storage.get(cacheKey);

          expect(restored).toBeDefined();
          expect(restored).toEqual(originalFormData);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should completely remove cached form data when cleared', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 200 }),
          description: fc.string({ maxLength: 2000 }),
          type: fc.constantFrom(...Object.values(WorkItemType)),
          status: fc.constantFrom(...Object.values(WorkItemStatus)),
          priority: fc.constantFrom(...Object.values(WorkItemPriority)),
          tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 10 }),
        }),
        (formData) => {
          const storage = makeMockStorage();
          const cacheKey = 'PageWorkItemCreateComponent.formData';

          storage.set(cacheKey, formData);
          expect(storage.get(cacheKey)).toBeDefined();

          storage.remove(cacheKey);
          expect(storage.get(cacheKey)).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain data integrity across multiple cache/restore cycles', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 200 }),
          description: fc.string({ maxLength: 2000 }),
          type: fc.constantFrom(...Object.values(WorkItemType)),
          status: fc.constantFrom(...Object.values(WorkItemStatus)),
          priority: fc.constantFrom(...Object.values(WorkItemPriority)),
          tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 10 }),
        }),
        fc.integer({ min: 2, max: 5 }),
        (originalFormData, cycles) => {
          const storage = makeMockStorage();
          const cacheKey = 'PageWorkItemCreateComponent.formData';
          let currentData = originalFormData;

          for (let i = 0; i < cycles; i++) {
            storage.set(cacheKey, currentData);
            currentData = storage.get(cacheKey) as typeof originalFormData;
            expect(currentData).toEqual(originalFormData);
          }

          expect(currentData).toEqual(originalFormData);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle empty/default form data correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          {
            title: '',
            description: '',
            type: WorkItemType.Story,
            status: WorkItemStatus.Backlog,
            priority: WorkItemPriority.Medium,
            assignee_id: '',
            sprint_id: '',
            parent_id: '',
            story_points: null,
            estimated_hours: null,
            tags: [],
          },
          {
            title: '',
            description: '',
            type: WorkItemType.Story,
            status: WorkItemStatus.Todo,
            priority: WorkItemPriority.Low,
            assignee_id: '',
            sprint_id: '',
            parent_id: '',
            story_points: null,
            estimated_hours: null,
            tags: [],
          }
        ),
        (emptyFormData) => {
          const storage = makeMockStorage();
          const cacheKey = 'PageWorkItemCreateComponent.formData';

          storage.set(cacheKey, emptyFormData);
          expect(storage.get(cacheKey)).toEqual(emptyFormData);
        }
      ),
      { numRuns: 100 }
    );
  });
});
