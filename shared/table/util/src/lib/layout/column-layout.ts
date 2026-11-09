import { TableModels } from '@ttrpg-ui/shared/table/models';

type ColumnDef<T> = TableModels.ColumnDef<T>;

export const columnId = <T>(column: ColumnDef<T>): string => column.id ?? column.field;

export function toSavedLayout<T>(columns: ColumnDef<T>[]): TableModels.SavedLayout {
  return {
    version: 1,
    columns: columns.map((c) => ({ id: columnId(c), hide: c.hide, pinned: c.pinned, width: c.width })),
  };
}

const isSavedLayout = (value: unknown): value is TableModels.SavedLayout =>
  typeof value === 'object' &&
  value !== null &&
  (value as TableModels.SavedLayout).version === 1 &&
  Array.isArray((value as TableModels.SavedLayout).columns);

const asPinned = (value: unknown): TableModels.SharedTablePinned =>
  value === 'left' || value === 'right' ? value : undefined;

/**
 * Applies a saved layout to the code's columns:
 * saved order for columns still in code, removed columns dropped,
 * new columns placed after their nearest code neighbour, everything else from code.
 * Anything that isn't a v1 layout is ignored.
 */
export function reconcileLayout<T>(saved: unknown, columns: ColumnDef<T>[]): ColumnDef<T>[] {
  if (!isSavedLayout(saved)) return [...columns];

  const byId = new Map(columns.map((c) => [columnId(c), c]));
  const result: ColumnDef<T>[] = [];
  const placed = new Set<string>();
  for (const s of saved.columns) {
    const column = typeof s?.id === 'string' ? byId.get(s.id) : undefined;
    if (!column || placed.has(s.id)) continue;
    const width = typeof s.width === 'number' && s.width > 0 ? s.width : column.width;
    result.push({ ...column, hide: s.hide === true, pinned: asPinned(s.pinned), width });
    placed.add(s.id);
  }

  columns.forEach((column, i) => {
    if (placed.has(columnId(column))) return;
    const previous = columns
      .slice(0, i)
      .reverse()
      .map((p) => result.findIndex((r) => columnId(r) === columnId(p)))
      .find((index) => index >= 0);
    result.splice(previous === undefined ? 0 : previous + 1, 0, column);
  });

  return result;
}
