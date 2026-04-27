import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TemplatePreviewComponent } from './template-preview.component';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

type WorkItemTemplate = SprintModels.Template.WorkItemTemplate;

const makeTemplate = (overrides: Partial<WorkItemTemplate> = {}): WorkItemTemplate => ({
  id: 'tpl-1',
  name: 'Bug Report',
  description: 'Template for reporting bugs',
  type: SprintModels.WorkItem.WorkItemType.Defect,
  defaultPriority: SprintModels.WorkItem.WorkItemPriority.High,
  defaultTags: ['bug', 'needs-triage'],
  customFields: [
    {
      key: 'affected_components',
      label: 'Affected Components',
      type: SprintModels.CustomField.CustomFieldType.MultiSelect,
      options: ['Auth', 'API', 'UI'],
    },
  ],
  ...overrides,
});

describe('TemplatePreviewComponent', () => {
  let component: TemplatePreviewComponent;
  let fixture: ComponentFixture<TemplatePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplatePreviewComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TemplatePreviewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('template', makeTemplate());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the template name', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Bug Report');
  });

  it('should display the template description', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Template for reporting bugs');
  });

  it('should display the template type', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain(SprintModels.WorkItem.WorkItemType.Defect);
  });

  it('should display the default priority', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain(SprintModels.WorkItem.WorkItemPriority.High);
  });

  it('should display all default tags', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('bug');
    expect(el.textContent).toContain('needs-triage');
  });

  it('should display custom field labels', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Affected Components');
  });

  it('should not show priority row when defaultPriority is absent', () => {
    fixture.componentRef.setInput('template', makeTemplate({ defaultPriority: undefined }));
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).not.toContain('Priority');
  });

  it('should not show tags row when defaultTags is empty', () => {
    fixture.componentRef.setInput('template', makeTemplate({ defaultTags: [] }));
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const tagElements = el.querySelectorAll('.template-preview__tag');
    expect(tagElements.length).toBe(0);
  });

  it('should not show custom fields row when customFields is empty', () => {
    fixture.componentRef.setInput('template', makeTemplate({ customFields: [] }));
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const fieldElements = el.querySelectorAll('.template-preview__field');
    expect(fieldElements.length).toBe(0);
  });

  it('should render one tag chip per default tag', () => {
    const template = makeTemplate({ defaultTags: ['alpha', 'beta', 'gamma'] });
    fixture.componentRef.setInput('template', template);
    fixture.detectChanges();
    const tagElements = fixture.nativeElement.querySelectorAll('.template-preview__tag');
    expect(tagElements.length).toBe(3);
  });

  it('should render one field chip per custom field', () => {
    const template = makeTemplate({
      customFields: [
        { key: 'f1', label: 'Field One', type: SprintModels.CustomField.CustomFieldType.Text },
        { key: 'f2', label: 'Field Two', type: SprintModels.CustomField.CustomFieldType.Number },
      ],
    });
    fixture.componentRef.setInput('template', template);
    fixture.detectChanges();
    const fieldElements = fixture.nativeElement.querySelectorAll('.template-preview__field');
    expect(fieldElements.length).toBe(2);
  });
});
