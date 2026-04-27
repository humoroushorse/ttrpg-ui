export enum CustomFieldType {
  Text = 'text',
  Number = 'number',
  Date = 'date',
  Select = 'select',
  MultiSelect = 'multi-select',
  Checkbox = 'checkbox',
}

export interface CustomFieldDefinition {
  key: string;
  label: string;
  type: CustomFieldType;
  required?: boolean;
  options?: string[]; // For select and multi-select types
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
}

export interface CustomFieldValue {
  key: string;
  value: any;
}
