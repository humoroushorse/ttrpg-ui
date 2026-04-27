import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PageWorkItemEditComponent } from './page-work-item-edit.component';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { WorkItemStore } from '@ttrpg-ui/features/sprint-management/data-access';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { WorkItemType, WorkItemStatus, WorkItemPriority } = SprintModels.WorkItem;
const SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN = SprintModels.Service.SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN;
type WorkItem = SprintModels.WorkItem.WorkItem;

describe('PageWorkItemEditComponent', () => {
  let component: PageWorkItemEditComponent;
  let fixture: ComponentFixture<PageWorkItemEditComponent>;

  const mockWorkItem: WorkItem = {
    id: 'test-id',
    title: 'Test Work Item',
    description: 'Test Description',
    type: WorkItemType.Story,
    status: WorkItemStatus.Backlog,
    priority: WorkItemPriority.Medium,
    assignee_id: null,
    sprint_id: null,
    parent_id: null,
    story_points: null,
    estimated_hours: null,
    actual_hours: null,
    tags: ['test-tag'],
    custom_fields: {},
    created_by: 'user-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_by: 'user-1',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageWorkItemEditComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
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
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'test-id',
              },
            },
            params: of({ id: 'test-id' }),
          },
        },
        {
          provide: SharedLocalStorageService,
          useValue: {
            get: vi.fn(),
            set: vi.fn(),
            remove: vi.fn(),
          },
        },
        {
          provide: SharedCoreService,
          useValue: {
            appTitle: 'Test App',
          },
        },
        {
          provide: WorkItemStore,
          useValue: {
            loadWorkItem: vi.fn(),
            update: vi.fn(),
            selectedEntity: vi.fn(() => mockWorkItem),
            error: vi.fn(() => null),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageWorkItemEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.workItemForm).toBeDefined();
  });

  it('should validate required fields', () => {
    const titleControl = component.workItemForm.get('title');
    // type and status controls are not needed for this test

    // Clear title to test validation
    titleControl?.setValue('');
    expect(titleControl?.hasError('required')).toBe(true);

    titleControl?.setValue('Updated Work Item');
    expect(titleControl?.hasError('required')).toBe(false);
  });

  it('should add and remove tags', () => {
    component.tagInput.set('new-tag');
    component.addTag();

    expect(component.tags()).toContain('new-tag');
    expect(component.tagInput()).toBe('');

    component.removeTag('new-tag');
    expect(component.tags()).not.toContain('new-tag');
  });

  it('should not add duplicate tags', () => {
    component.tagInput.set('duplicate-tag');
    component.addTag();
    component.tagInput.set('duplicate-tag');
    component.addTag();

    expect(component.tags().filter((t) => t === 'duplicate-tag').length).toBe(1);
  });
});
