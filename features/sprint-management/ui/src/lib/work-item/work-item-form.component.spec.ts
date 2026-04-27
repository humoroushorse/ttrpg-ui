import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';

import { WorkItemFormComponent } from './work-item-form.component';
import {
  SprintModels,
} from '@ttrpg-ui/features/sprint-management/models';

const { WorkItemStatus } = SprintModels.WorkItem;
const SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN = SprintModels.Service.SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN;
describe('WorkItemFormComponent', () => {
  let component: WorkItemFormComponent;
  let fixture: ComponentFixture<WorkItemFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkItemFormComponent, NoopAnimationsModule],
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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkItemFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.form.get('title')?.value).toBe('');
    expect(component.form.get('status')?.value).toBe(WorkItemStatus.Todo);
  });

  it('should mark form as invalid when title is empty', () => {
    component.form.patchValue({ title: '' });
    expect(component.form.valid).toBe(false);
  });

  it('should mark form as valid when required fields are filled', () => {
    component.form.patchValue({
      title: 'Test Work Item',
      description: 'desc',
      type: SprintModels.WorkItem.WorkItemType.Epic, // Epic has no parent_id requirement
      status: WorkItemStatus.Todo,
      project_id: 'proj-1',
    });
    expect(component.form.valid).toBe(true);
  });

  it('should emit formSubmit when form is submitted', () => {
    let emittedValue: any;
    component.formSubmitted.subscribe((value) => {
      emittedValue = value;
    });

    component.form.patchValue({
      title: 'Test Work Item',
      description: 'desc',
      type: SprintModels.WorkItem.WorkItemType.Epic,
      status: WorkItemStatus.Todo,
      project_id: 'proj-1',
    });

    component.onSubmit();

    expect(emittedValue).toBeDefined();
    expect(emittedValue.title).toBe('Test Work Item');
  });

  it('should not emit formSubmit when form is invalid', () => {
    let emitted = false;
    component.formSubmitted.subscribe(() => {
      emitted = true;
    });

    component.form.patchValue({ title: '' });
    component.onSubmit();

    expect(emitted).toBe(false);
  });

  it('should emit formCancel when cancel is clicked', () => {
    let emitted = false;
    component.cancelled.subscribe(() => {
      emitted = true;
    });

    component.onCancel();

    expect(emitted).toBe(true);
  });
});
