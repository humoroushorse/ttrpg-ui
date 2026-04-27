import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { signal } from '@angular/core';
import { TemplateSelectorComponent } from './template-selector.component';
import { TemplateStore } from '@ttrpg-ui/features/sprint-management/data-access';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

type WorkItemTemplate = SprintModels.Template.WorkItemTemplate;

const mockTemplates: WorkItemTemplate[] = [
  {
    id: '1',
    name: 'Bug Template',
    description: 'Template for bugs',
    type: SprintModels.WorkItem.WorkItemType.Defect,
    defaultPriority: SprintModels.WorkItem.WorkItemPriority.High,
    defaultTags: ['bug'],
    customFields: [],
  },
  {
    id: '2',
    name: 'Feature Template',
    description: 'Template for features',
    type: SprintModels.WorkItem.WorkItemType.Story,
    defaultPriority: SprintModels.WorkItem.WorkItemPriority.Medium,
    defaultTags: ['feature'],
    customFields: [],
  },
];

const mockTemplateStore = {
  entities: signal(mockTemplates),
  loading: signal(false),
  loadTemplates: vi.fn(),
};

describe('TemplateSelectorComponent', () => {
  let component: TemplateSelectorComponent;
  let fixture: ComponentFixture<TemplateSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateSelectorComponent, NoopAnimationsModule],
      providers: [{ provide: TemplateStore, useValue: mockTemplateStore }],
    }).compileComponents();

    fixture = TestBed.createComponent(TemplateSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadTemplates on init', () => {
    expect(mockTemplateStore.loadTemplates).toHaveBeenCalled();
  });

  it('should expose templates from the store', () => {
    expect(component.templates()).toEqual(mockTemplates);
  });

  it('should have no selected template initially', () => {
    expect(component.selectedTemplate()).toBeNull();
  });

  it('should emit templateSelected when a template is selected', () => {
    const spy = vi.spyOn(component.templateSelected, 'emit');
    component.onTemplateChange({ value: mockTemplates[0] });
    expect(spy).toHaveBeenCalledWith(mockTemplates[0]);
  });

  it('should update selectedTemplate signal when a template is selected', () => {
    component.onTemplateChange({ value: mockTemplates[0] });
    expect(component.selectedTemplate()).toEqual(mockTemplates[0]);
  });

  it('should emit null when clearSelection is called', () => {
    const spy = vi.spyOn(component.templateSelected, 'emit');
    component.onTemplateChange({ value: mockTemplates[0] });
    component.clearSelection();
    expect(spy).toHaveBeenLastCalledWith(null);
  });

  it('should reset selectedTemplate to null when clearSelection is called', () => {
    component.onTemplateChange({ value: mockTemplates[0] });
    component.clearSelection();
    expect(component.selectedTemplate()).toBeNull();
  });

  it('should emit null when selecting the none option', () => {
    const spy = vi.spyOn(component.templateSelected, 'emit');
    component.onTemplateChange({ value: null });
    expect(spy).toHaveBeenCalledWith(null);
  });

  it('should use default placeholder text', () => {
    expect(component.placeholder()).toBe('Choose a template...');
  });

  it('should use default showNoneOption as true', () => {
    expect(component.showNoneOption()).toBe(true);
  });
});
