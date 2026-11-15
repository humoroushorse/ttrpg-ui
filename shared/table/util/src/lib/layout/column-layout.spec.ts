import { TableModels } from '@ttrpg-ui/shared/table/models';
import { columnId, reconcileLayout, toSavedLayout } from './column-layout';

type Row = { a: string; b: string; c: string; d: string };
const col = (field: string, extra: Partial<TableModels.ColumnDef<Row>> = {}): TableModels.ColumnDef<Row> =>
  ({ field, headerName: field.toUpperCase(), cellDataType: 'text', ...extra }) as TableModels.ColumnDef<Row>;

const ids = (columns: TableModels.ColumnDef<Row>[]) => columns.map(columnId);

describe('reconcileLayout', () => {
  const code = [col('a'), col('b'), col('c'), col('d')];

  it('ignores missing, invalid and old-version layouts', () => {
    for (const saved of [null, undefined, 'x', [], { version: 2, columns: [] }, [{ field: 'a' }]]) {
      expect(ids(reconcileLayout(saved, code))).toEqual(['a', 'b', 'c', 'd']);
    }
  });

  it('keeps saved order and state, takes the rest from code', () => {
    const saved = { version: 1, columns: [{ id: 'c', hide: true }, { id: 'a', pinned: 'left', width: 120 }, { id: 'b' }, { id: 'd' }] };
    const result = reconcileLayout(saved, [col('a', { headerName: 'New A' }), col('b'), col('c'), col('d')]);
    expect(ids(result)).toEqual(['c', 'a', 'b', 'd']);
    expect(result[0].hide).toBe(true);
    expect(result[1]).toMatchObject({ pinned: 'left', width: 120, headerName: 'New A' });
  });

  it('drops removed columns and puts new ones after their code neighbour', () => {
    const saved = { version: 1, columns: [{ id: 'c' }, { id: 'gone' }, { id: 'a' }] };
    // b follows a in code, d follows c
    expect(ids(reconcileLayout(saved, code))).toEqual(['c', 'd', 'a', 'b']);
  });

  it('puts a new first column first', () => {
    expect(ids(reconcileLayout({ version: 1, columns: [{ id: 'b' }, { id: 'c' }, { id: 'd' }] }, code))).toEqual([
      'a',
      'b',
      'c',
      'd',
    ]);
  });

  it('skips duplicate and malformed entries and bad values', () => {
    const saved = { version: 1, columns: [{ id: 'b', pinned: 'middle', width: -5 }, { id: 'b' }, null, { id: 3 }] };
    const result = reconcileLayout(saved, code);
    expect(ids(result)).toEqual(['a', 'b', 'c', 'd']);
    expect(result[1]).toMatchObject({ pinned: undefined, width: undefined });
  });

  it('round-trips through toSavedLayout, using id over field', () => {
    const columns = [col('a', { id: 'actions', hide: true }), col('b', { hide: false, pinned: 'right', width: 80 })];
    const saved = JSON.parse(JSON.stringify(toSavedLayout(columns)));
    expect(saved.columns[0].id).toBe('actions');
    expect(reconcileLayout(saved, columns)).toEqual(columns);
  });
});
