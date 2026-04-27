import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { CustomFieldListComponent } from './custom-field-list.component';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const { CustomFieldType } = SprintModels.CustomField;
type CustomFieldDefinition = SprintModels.CustomField.CustomFieldDefinition;
type CustomFieldValue = SprintModels.CustomField.CustomFieldValue;

const mockDefinitions: CustomFieldDefinition[] = [
  { key: 'external_ticket', label: 'External Ticket ID', type: CustomFieldType.Text, placeholder: 'e.g. JIRA-1234' },
  { key: 'complexity_score', label: 'Complexity Score', type: CustomFieldType.Number },
  { key: 'story_category', label: 'Story Category', type: CustomFieldType.Select, options: ['Frontend', 'Backend'] },
];

describe('CustomFieldListComponent', () => {
  let component: CustomFieldListComponent;
  let fixture: ComponentFixture<CustomFieldListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomFieldListComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomFieldListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('fieldDefinitions', mockDefinitions);
    fixture.componentRef.setInput('values', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a field for each definition', () => {
    const fields = fixture.nativeElement.querySelectorAll('lib-custom-field');
    expect(fields.length).toBe(mockDefinitions.length);
  });

  it('should return null for a field with no value', () => {
    expect(component.getValueForField('external_ticket')).toBeNull();
  });

  it('should return the value for a field that has one', () => {
    const values: CustomFieldValue[] = [{ key: 'external_ticket', value: 'JIRA-42' }];
    fixture.componentRef.setInput('values', values);
    fixture.detectChanges();
    expect(component.getValueForField('external_ticket')).toBe('JIRA-42');
  });

  it('should emit valuesChange when a field value changes', () => {
    const spy = vi.spyOn(component.valuesChange, 'emit');

    component.onFieldValueChange({ key: 'external_ticket', value: 'JIRA-99' });

    expect(spy).toHaveBeenCalledWith([{ key: 'external_ticket', value: 'JIRA-99' }]);
  });

  it('should update an existing value when the same key changes', () => {
    const spy = vi.spyOn(component.valuesChange, 'emit');

    component.onFieldValueChange({ key: 'external_ticket', value: 'JIRA-1' });
    component.onFieldValueChange({ key: 'external_ticket', value: 'JIRA-2' });

    const lastCall = spy.mock.calls[spy.mock.calls.length - 1][0] as CustomFieldValue[];
    const matches = lastCall.filter((v) => v.key === 'external_ticket');
    expect(matches.length).toBe(1);
    expect(matches[0].value).toBe('JIRA-2');
  });

  it('should accumulate values for different keys', () => {
    const spy = vi.spyOn(component.valuesChange, 'emit');

    component.onFieldValueChange({ key: 'external_ticket', value: 'JIRA-1' });
    component.onFieldValueChange({ key: 'complexity_score', value: 5 });

    const lastCall = spy.mock.calls[spy.mock.calls.length - 1][0] as CustomFieldValue[];
    expect(lastCall.length).toBe(2);
  });
});
