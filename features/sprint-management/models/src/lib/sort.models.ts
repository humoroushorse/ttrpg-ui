export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export interface SortModel {
  field: string;
  direction: SortDirection;
  priority: number;
}

export interface SortState {
  sorts: SortModel[];
}
