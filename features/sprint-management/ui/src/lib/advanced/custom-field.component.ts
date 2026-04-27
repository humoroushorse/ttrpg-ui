import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { CustomFieldType } = SprintModels.CustomField;
type CustomFieldDefinition = SprintModels.CustomField.CustomFieldDefinition;
type CustomFieldType = SprintModels.CustomField.CustomFieldType;

/**
 * Custom Field Component
 *
 * Dynamic field renderer based on field type.
 * Supports text, number, date, select, multi-select, and checkbox field types.
 *
 */
@Component({
  selector: 'lib-custom-field',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './custom-field.component.html',
  styleUrl: './custom-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomFieldComponent {
  fieldDefinition = input.required<CustomFieldDefinition>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value = input<any>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  valueChange = output<{ key: string; value: any }>();

  readonly CustomFieldType = CustomFieldType;

  currentValue = computed(() => {
    const val = this.value();
    const defaultVal = this.fieldDefinition().defaultValue;
    return val !== null && val !== undefined ? val : defaultVal;
  });

  onValueChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = this.fieldDefinition().type === CustomFieldType.Number ? parseFloat(target.value) : target.value;

    this.valueChange.emit({
      key: this.fieldDefinition().key,
      value: value,
    });
  }

  onDateChange(event: { value: Date }): void {
    this.valueChange.emit({
      key: this.fieldDefinition().key,
      value: event.value,
    });
  }

  onSelectChange(event: { value: string | string[] }): void {
    this.valueChange.emit({
      key: this.fieldDefinition().key,
      value: event.value,
    });
  }

  onCheckboxChange(event: { checked: boolean }): void {
    this.valueChange.emit({
      key: this.fieldDefinition().key,
      value: event.checked,
    });
  }
}
