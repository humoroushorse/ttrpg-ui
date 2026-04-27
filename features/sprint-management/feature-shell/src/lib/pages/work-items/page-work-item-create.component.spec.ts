import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageWorkItemCreateComponent } from './page-work-item-create.component';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { WorkItemStore } from '@ttrpg-ui/features/sprint-management/data-access';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN = SprintModels.Service.SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN;
const { WorkItemType, WorkItemStatus, WorkItemPriority } = SprintModels.WorkItem;

describe('PageWorkItemCreateComponent', () => {
  let component: PageWorkItemCreateComponent;
  let fixture: ComponentFixture<PageWorkItemCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageWorkItemCreateComponent, FormsModule],
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
            create: vi.fn(),
            error: vi.fn(() => null),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageWorkItemCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.workItemForm).toBeDefined();
    expect(component.workItemForm.get('type')?.value).toBe(WorkItemType.Story);
    expect(component.workItemForm.get('status')?.value).toBe(WorkItemStatus.Backlog);
    expect(component.workItemForm.get('priority')?.value).toBe(WorkItemPriority.Medium);
  });

  it('should validate required fields', () => {
    const titleControl = component.workItemForm.get('title');
    const typeControl = component.workItemForm.get('type');
    const statusControl = component.workItemForm.get('status');

    expect(titleControl?.hasError('required')).toBe(true);
    expect(typeControl?.hasError('required')).toBe(false); // Has default value
    expect(statusControl?.hasError('required')).toBe(false); // Has default value

    titleControl?.setValue('Test Work Item');
    expect(titleControl?.hasError('required')).toBe(false);
  });

  it('should add and remove tags', () => {
    component.tagInput.set('test-tag');
    component.addTag();

    expect(component.tags()).toContain('test-tag');
    expect(component.tagInput()).toBe('');

    component.removeTag('test-tag');
    expect(component.tags()).not.toContain('test-tag');
  });

  it('should not add duplicate tags', () => {
    component.tagInput.set('test-tag');
    component.addTag();
    component.tagInput.set('test-tag');
    component.addTag();

    expect(component.tags().filter((t) => t === 'test-tag').length).toBe(1);
  });

  it('should mark form as invalid when required fields are missing', () => {
    expect(component.workItemForm.invalid).toBe(true);

    component.workItemForm.patchValue({
      title: 'Test Work Item',
      description: 'Test Description',
      project_id: 'proj-1',
      type: WorkItemType.Epic, // Epic has no parent_id requirement
    });

    expect(component.workItemForm.invalid).toBe(false);
  });
});
