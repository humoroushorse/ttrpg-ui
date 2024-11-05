import { Type } from '@angular/core';

export type SharedTableTypes = 'component' | 'text' | 'date';

export type SharedTablePinned = 'left' | 'right' | undefined;

interface BaseColumnDef {
  field: string;
  headerName: string;
  sortable?: boolean;
  pinned?: SharedTablePinned;
  hide?: boolean;
  valueGetter?(data: any): any;
}

interface ComponentColumnDef extends BaseColumnDef {
  cellDataType: 'component';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: Type<any>;
}

interface NonComponentColumnDef extends BaseColumnDef {
  cellDataType: 'text' | 'number' | 'date' | 'boolean';
  component?: never;
}

export type ColumnDef = ComponentColumnDef | NonComponentColumnDef;
