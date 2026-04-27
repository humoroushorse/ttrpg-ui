import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

type SortState = SprintModels.Sort.SortState;
// SortModel is used as a type reference for the serialized format
type _SortModel = SprintModels.Sort.SortModel;

export function serializeSorts(sortState: SortState): string {
  return JSON.stringify(sortState);
}

export function deserializeSorts(serialized: string): SortState {
  if (!serialized || serialized.trim() === '') {
    return { sorts: [] };
  }

  try {
    const parsed = JSON.parse(serialized);
    return {
      sorts: Array.isArray(parsed.sorts) ? parsed.sorts : [],
    };
  } catch (error) {
    console.error('Failed to deserialize sorts:', error);
    return { sorts: [] };
  }
}
