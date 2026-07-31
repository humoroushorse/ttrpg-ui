import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';

import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';
import { CustomFieldComponent } from './custom-field.component';

type CustomFieldDefinition = SprintModels.CustomField.CustomFieldDefinition;
type CustomFieldValue = SprintModels.CustomField.CustomFieldValue;

@Component({
  selector: 'lib-custom-field-list',
  standalone: true,
  imports: [CustomFieldComponent],
  templateUrl: './custom-field-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './custom-field-list.component.scss',
})
export class CustomFieldListComponent {
  fieldDefinitions = input.required<CustomFieldDefinition[]>();
  values = input<CustomFieldValue[]>([]);

  valuesChange = output<CustomFieldValue[]>();

  private currentValues = signal<CustomFieldValue[]>([]);

  getValueForField(key: string): any {
    const all = this.currentValues().length ? this.currentValues() : this.values();
    return all.find((v) => v.key === key)?.value ?? null;
  }

  onFieldValueChange(event: { key: string; value: any }): void {
    const existing = this.currentValues().length ? this.currentValues() : [...this.values()];
    const idx = existing.findIndex((v) => v.key === event.key);
    let updated: CustomFieldValue[];
    if (idx >= 0) {
      updated = existing.map((v) => (v.key === event.key ? { key: event.key, value: event.value } : v));
    } else {
      updated = [...existing, { key: event.key, value: event.value }];
    }
    this.currentValues.set(updated);
    this.valuesChange.emit(updated);
  }
}
