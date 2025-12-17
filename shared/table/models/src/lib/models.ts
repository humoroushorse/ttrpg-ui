import { Type } from '@angular/core';

export type SharedTableTypes = 'component' | 'text' | 'date';

export type SharedTablePinned = 'left' | 'right' | undefined;

interface BaseColumnDef<T> {
  field: string;
  headerName: string;
  sortable?: boolean;
  pinned?: SharedTablePinned;
  hide?: boolean;
  valueGetter?(data: T): any;
  appHideColumnSettingsMenu?: boolean;
  filter?: 'agTextColumnFilter' | 'agNumberColumnFilter' | 'agDateColumnFilter' | 'agSetColumnFilter';
  filterParams?: { values: any[] };
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
