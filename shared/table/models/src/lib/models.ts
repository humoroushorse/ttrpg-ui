import { InjectionToken, Type } from '@angular/core';
import { Observable } from 'rxjs';
import { SharedModels } from '@ttrpg-ui/shared/models';

export type SharedTableTypes = 'component' | 'text' | 'date';

export type SharedTablePinned = 'left' | 'right' | undefined;

/**
 * AG Grid's provided filters, plus ours (`app*`) where AG Grid Community has none.
 * The models they produce are in `SharedModels.Store` (`Filter`).
 */
export type ColumnFilterName =
  | 'agTextColumnFilter'
  | 'agNumberColumnFilter'
  | 'agDateColumnFilter'
  | 'appBooleanColumnFilter'
  /** a list of values known up front */
  | 'appSetColumnFilter'
  /** values paged in from an API, with search and infinite scroll */
  | 'appApiSetColumnFilter';

/** What a date filter lets you pick. `datetime` isn't implemented yet. */
export type DateFilterGranularity = 'year' | 'date' | 'datetime';

export interface SetFilterOption {
  /** `null` is blank */
  value: string | null;
  label: string;
}

export interface SetFilterPageQuery {
  search: string;
  offset: number;
  limit: number;
}

export interface SetFilterPage {
  options: SetFilterOption[];
  /** every option that matches `search` */
  total: number;
}

/**
 * A column filter's settings: AG Grid's `filterParams` names where it has them, `app*` for ours.
 * Merged over the built-in defaults for the filter, then `SHARED_TABLE_FILTER_DEFAULTS`.
 */
export interface ColumnFilterParams {
  /** the operators offered, in order (AG Grid) */
  filterOptions?: SharedModels.Store.FilterType[];
  /** the operator picked when the filter opens (AG Grid) */
  defaultOption?: SharedModels.Store.FilterType;
  /** wait this long after typing before applying (AG Grid) */
  debounceMs?: number;
  /** set filter: the values to pick from (AG Grid's set filter) */
  values?: (string | null)[];
  /** set filter: a value's label (AG Grid's set filter) */
  valueFormatter?: (params: { value: string | null }) => string;
  /** set filters: pick one value or many (default: many) */
  appSelectMode?: 'single' | 'multi';
  /** API set filter: loads one page of options */
  appValuesPage?: (query: SetFilterPageQuery) => Observable<SetFilterPage>;
  /** date filter: pick a year, a date, or a date and time */
  appGranularity?: DateFilterGranularity;

  // Validation. An invalid value shows its error under the field and isn't applied
  // (the filter keeps what it had). Empty fields aren't errors, just not a filter yet.

  /** number filter: lowest value allowed (also the input's min) */
  appMin?: number;
  /** number filter: highest value allowed (also the input's max) */
  appMax?: number;
  /** number filter: whole numbers only (also the input's step) */
  appIntegerOnly?: boolean;
  /** date filter: earliest year allowed (AG Grid) */
  minValidYear?: number;
  /** date filter: latest year allowed (AG Grid) */
  maxValidYear?: number;
  /** date filter: earliest date allowed, 'YYYY-MM-DD' (AG Grid) */
  minValidDate?: string;
  /** date filter: latest date allowed, 'YYYY-MM-DD' (AG Grid) */
  maxValidDate?: string;
  /**
   * Any filter with typed values: runs after the checks above. Gets the raw value ('3',
   * '2024', '2024-03-05', or the text) and which end of a range it is; returns an error or null.
   */
  appValidate?: (value: string, end: 'from' | 'to') => string | null;
}

/** App-wide filter settings by filter, e.g. numbers default to `inRange` */
export type ColumnFilterDefaults = Partial<Record<ColumnFilterName, ColumnFilterParams>>;

export const SHARED_TABLE_FILTER_DEFAULTS = new InjectionToken<ColumnFilterDefaults>('Shared table filter defaults', {
  factory: () => ({}),
});

/** Built-in filter settings (AG Grid's operator lists and defaults) */
export const BUILT_IN_FILTER_PARAMS: Record<ColumnFilterName, ColumnFilterParams> = {
  agTextColumnFilter: {
    filterOptions: ['contains', 'notContains', 'equals', 'notEqual', 'startsWith', 'endsWith', 'blank', 'notBlank'],
    defaultOption: 'contains',
    debounceMs: 300,
  },
  agNumberColumnFilter: {
    filterOptions: [
      'equals',
      'notEqual',
      'lessThan',
      'lessThanOrEqual',
      'greaterThan',
      'greaterThanOrEqual',
      'inRange',
      'blank',
      'notBlank',
    ],
    defaultOption: 'equals',
    debounceMs: 300,
  },
  agDateColumnFilter: {
    filterOptions: ['equals', 'notEqual', 'lessThan', 'greaterThan', 'inRange', 'blank', 'notBlank'],
    defaultOption: 'equals',
    debounceMs: 300,
    appGranularity: 'date',
  },
  appBooleanColumnFilter: { filterOptions: ['true', 'false'], debounceMs: 0 },
  appSetColumnFilter: { appSelectMode: 'multi', debounceMs: 0 },
  appApiSetColumnFilter: { appSelectMode: 'multi', debounceMs: 0 },
};

interface BaseColumnDef<T> {
  /** defaults to `field`; set it for computed columns that share or lack a field */
  id?: string;
  field: string;
  /** px, saved with the layout once the user resizes */
  width?: number;
  headerName: string;
  /** shown on hover over the header (AG Grid) */
  headerTooltip?: string;
  sortable?: boolean;
  pinned?: SharedTablePinned;
  hide?: boolean;
  /** The cell's value, for columns without a field or that compute one (used to filter, sort and show) */
  valueGetter?(data: T): any;
  /**
   * What the cell shows, from its value (AG Grid). Display only: filters and sorts still use the value.
   * Wins over `cellDataType` rendering (number pipe, checkbox, date pipe), not over components.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  valueFormatter?: (params: { value: any; data: T }) => string;
  /** date format for date cells, e.g. 'y' for year only (default: user's preference) */
  dateFormat?: string;
  appHideColumnSettingsMenu?: boolean;
  /** `true` picks the filter from `cellDataType` (AG Grid); a name picks it outright */
  filter?: boolean | ColumnFilterName;
  filterParams?: ColumnFilterParams;
}

interface ComponentColumnDef<T> extends BaseColumnDef<T> {
  cellDataType: 'component';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: Type<any>;
}

interface NonComponentColumnDef<T> extends BaseColumnDef<T> {
  cellDataType: 'text' | 'number' | 'date' | 'boolean';
  component?: never;
}

export type ColumnDef<T> = ComponentColumnDef<T> | NonComponentColumnDef<T>;

const FILTER_BY_DATA_TYPE: Partial<Record<ColumnDef<unknown>['cellDataType'], ColumnFilterName>> = {
  text: 'agTextColumnFilter',
  number: 'agNumberColumnFilter',
  date: 'agDateColumnFilter',
  boolean: 'appBooleanColumnFilter',
};

/** The column's id in layouts, sorts and filters */
export const columnId = (columnDef: Pick<ColumnDef<unknown>, 'id' | 'field'>): string => columnDef.id ?? columnDef.field;

/** The filter a column uses, or null for none */
export const columnFilterName = <T>(columnDef: ColumnDef<T>): ColumnFilterName | null => {
  if (!columnDef.filter) return null;
  return columnDef.filter === true ? (FILTER_BY_DATA_TYPE[columnDef.cellDataType] ?? null) : columnDef.filter;
};

/** What gets saved per table; everything else always comes from code */
export interface SavedColumn {
  id: string;
  hide?: boolean;
  pinned?: SharedTablePinned;
  width?: number;
}

export interface SavedLayout {
  version: 1;
  columns: SavedColumn[];
}
