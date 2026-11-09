import { SharedModels } from '@ttrpg-ui/shared/models';
import { TableModels } from '@ttrpg-ui/shared/table/models';

type Filter = SharedModels.Store.Filter;
type FilterType = SharedModels.Store.FilterType;

/** What a column filter emits: the new model (null clears it) and how long to wait before applying it */
export interface FilterChange {
  model: Filter | null;
  debounceMs: number;
}

const OPERATOR_LABELS: Record<FilterType, string> = {
  contains: 'Contains',
  notContains: 'Does not contain',
  equals: 'Equals',
  notEqual: 'Does not equal',
  startsWith: 'Starts with',
  endsWith: 'Ends with',
  lessThan: 'Less than',
  lessThanOrEqual: 'Less than or equal',
  greaterThan: 'Greater than',
  greaterThanOrEqual: 'Greater than or equal',
  inRange: 'Between',
  blank: 'Blank',
  notBlank: 'Not blank',
  true: 'Yes',
  false: 'No',
};

const DATE_LABELS: Partial<Record<FilterType, string>> = { lessThan: 'Before', greaterThan: 'After' };

export const operatorLabel = (type: FilterType, filter: TableModels.ColumnFilterName | null): string =>
  (filter === 'agDateColumnFilter' && DATE_LABELS[type]) || OPERATOR_LABELS[type];

/** Operators that take no value */
export const takesNoValue = (type: FilterType | undefined): boolean => type === 'blank' || type === 'notBlank';

/** Built-in settings, then the app's (`SHARED_TABLE_FILTER_DEFAULTS`), then the column's */
export const resolveFilterParams = (
  filter: TableModels.ColumnFilterName,
  appDefaults: TableModels.ColumnFilterDefaults,
  column: TableModels.ColumnFilterParams | undefined,
): TableModels.ColumnFilterParams => ({
  ...TableModels.BUILT_IN_FILTER_PARAMS[filter],
  ...appDefaults[filter],
  ...column,
});

const lower = (value: unknown): string => (value == null ? '' : String(value).toLowerCase());

const toNumber = (value: unknown): number | null =>
  value == null || value === '' || Number.isNaN(Number(value)) ? null : Number(value);

/** 'YYYY-MM-DD' for a cell value (a Date or an ISO string) */
const toDay = (value: unknown): string | null => {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
};

const compare = (value: number | string, type: FilterType, low: number | string, high?: number | string | null) => {
  switch (type) {
    case 'equals':
      return value === low;
    case 'notEqual':
      return value !== low;
    case 'lessThan':
      return value < low;
    case 'lessThanOrEqual':
      return value <= low;
    case 'greaterThan':
      return value > low;
    case 'greaterThanOrEqual':
      return value >= low;
    case 'inRange':
      return high != null && value >= (low < high ? low : high) && value <= (low < high ? high : low);
    default:
      return true;
  }
};

const YEAR = /^\d{4}$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

const rangeError = (min: number | string | undefined, max: number | string | undefined): string => {
  if (min !== undefined && max !== undefined) return `Must be ${min} to ${max}`;
  return min !== undefined ? `Must be ${min} or later` : `Must be ${max} or earlier`;
};

const numberRangeError = (min: number | undefined, max: number | undefined): string => {
  if (min !== undefined && max !== undefined) return `Must be ${min} to ${max}`;
  return min !== undefined ? `Must be ${min} or more` : `Must be ${max} or less`;
};

/**
 * The error for one typed filter value, or null when it's fine (or empty: that's just no filter yet).
 * Built-in checks from `filterParams`, then its `appValidate`.
 */
export const validateFilterValue = (
  filter: TableModels.ColumnFilterName | null,
  params: TableModels.ColumnFilterParams,
  raw: string,
  end: 'from' | 'to',
): string | null => {
  const value = raw.trim();
  if (!value) return null;
  if (filter === 'agNumberColumnFilter') {
    const number = Number(value);
    if (Number.isNaN(number)) return 'Enter a number';
    if (params.appIntegerOnly && !Number.isInteger(number)) return 'Whole numbers only';
    const { appMin: min, appMax: max } = params;
    if ((min !== undefined && number < min) || (max !== undefined && number > max)) return numberRangeError(min, max);
  }
  if (filter === 'agDateColumnFilter') {
    const year = params.appGranularity === 'year';
    if (year ? !YEAR.test(value) : !DAY.test(value)) return year ? 'Enter a year (YYYY)' : 'Enter a date';
    const { minValidYear: minYear, maxValidYear: maxYear } = params;
    const valueYear = Number(value.slice(0, 4));
    if ((minYear !== undefined && valueYear < minYear) || (maxYear !== undefined && valueYear > maxYear)) {
      return rangeError(minYear, maxYear);
    }
    // a year filter compares years, so its date limits do too
    const min = year ? params.minValidDate?.slice(0, 4) : params.minValidDate;
    const max = year ? params.maxValidDate?.slice(0, 4) : params.maxValidDate;
    if ((min && value < min) || (max && value > max)) return rangeError(min, max);
  }
  return params.appValidate?.(value, end) ?? null;
};

/** Whether a cell value passes a column filter, for tables that filter their own rows (same rules as the API) */
export const matchesFilter = (value: unknown, model: Filter): boolean => {
  switch (model.filterType) {
    case 'text': {
      const cell = lower(value);
      const filter = lower(model.filter);
      const checks: Record<SharedModels.Store.TextFilterType, () => boolean> = {
        contains: () => cell.includes(filter),
        notContains: () => !cell.includes(filter),
        equals: () => cell === filter,
        notEqual: () => cell !== filter,
        startsWith: () => cell.startsWith(filter),
        endsWith: () => cell.endsWith(filter),
        blank: () => cell === '',
        notBlank: () => cell !== '',
      };
      return checks[model.type]();
    }
    case 'number': {
      const cell = toNumber(value);
      if (takesNoValue(model.type)) return (cell === null) === (model.type === 'blank');
      return cell !== null && model.filter != null && compare(cell, model.type, model.filter, model.filterTo);
    }
    case 'date': {
      if (takesNoValue(model.type)) return (value == null || value === '') === (model.type === 'blank');
      if (!model.dateFrom) return true;
      // a number is a year column (dnd_version_year): compare years
      if (typeof value === 'number') {
        return compare(value, model.type, Number(model.dateFrom.slice(0, 4)), model.dateTo && Number(model.dateTo.slice(0, 4)));
      }
      const cell = toDay(value);
      return cell !== null && compare(cell, model.type, model.dateFrom.slice(0, 10), model.dateTo?.slice(0, 10));
    }
    case 'boolean':
      if (model.type === 'blank') return value == null;
      if (model.type === 'notBlank') return value != null;
      return value === (model.type === 'true');
    case 'set':
      return model.values.includes(value == null ? null : String(value));
  }
};
