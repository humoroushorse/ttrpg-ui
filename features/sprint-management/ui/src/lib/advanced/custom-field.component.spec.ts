import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { CustomFieldComponent } from './custom-field.component';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const { CustomFieldType } = SprintModels.CustomField;
type CustomFieldDefinition = SprintModels.CustomField.CustomFieldDefinition;

describe('CustomFieldComponent', () => {
  let component: CustomFieldComponent;
  let fixture: ComponentFixture<CustomFieldComponent>;

  const mockTextField: CustomFieldDefinition = {
    key: 'test_field',
    label: 'Test Field',
    type: CustomFieldType.Text,
    required: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomFieldComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomFieldComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('fieldDefinition', mockTextField);
    fixture.componentRef.setInput('value', '');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit valueChange when text field value changes', () => {
    const spy = vi.spyOn(component.valueChange, 'emit');
    const mockEvent = { target: { value: 'new value' } } as unknown as Event;
    component.onValueChange(mockEvent);
    expect(spy).toHaveBeenCalledWith({ key: 'test_field', value: 'new value' });
  });

  it('should handle number field type', () => {
    const numberField: CustomFieldDefinition = {
      key: 'number_field',
      label: 'Number Field',
      type: CustomFieldType.Number,
      required: false,
    };
    fixture.componentRef.setInput('fieldDefinition', numberField);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should handle date field type', () => {
    const dateField: CustomFieldDefinition = {
      key: 'date_field',
      label: 'Date Field',
      type: CustomFieldType.Date,
      required: false,
    };
    fixture.componentRef.setInput('fieldDefinition', dateField);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should handle select field type with options', () => {
    const selectField: CustomFieldDefinition = {
      key: 'select_field',
      label: 'Select Field',
      type: CustomFieldType.Select,
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3'],
    };
    fixture.componentRef.setInput('fieldDefinition', selectField);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
