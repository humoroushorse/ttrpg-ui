export enum FilterType {
  Text = 'text',
  Number = 'number',
  Date = 'date',
  Set = 'set',
}

export enum FilterCondition {
  Equals = 'equals',
  NotEquals = 'notEquals',
  Contains = 'contains',
  NotContains = 'notContains',
  StartsWith = 'startsWith',
  EndsWith = 'endsWith',
  LessThan = 'lessThan',
  LessThanOrEqual = 'lessThanOrEqual',
  GreaterThan = 'greaterThan',
  GreaterThanOrEqual = 'greaterThanOrEqual',
  InRange = 'inRange',
  Blank = 'blank',
  NotBlank = 'notBlank',
}

export interface FilterModel {
  field: string;
  type: FilterType;
  condition: FilterCondition;
  value: any;
  value_to?: any;
}

export interface FilterState {
  filters: FilterModel[];
  operator: 'AND' | 'OR';
}
