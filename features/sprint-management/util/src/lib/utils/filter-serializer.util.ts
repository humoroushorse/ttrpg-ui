import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

type FilterState = SprintModels.Filter.FilterState;
// FilterModel is used as a type reference for the serialized format
type _FilterModel = SprintModels.Filter.FilterModel;

export function serializeFilters(filterState: FilterState): string {
  return JSON.stringify(filterState);
}

export function deserializeFilters(serialized: string): FilterState {
  if (!serialized || serialized.trim() === '') {
    return { filters: [], operator: 'AND' };
  }

  try {
    const parsed = JSON.parse(serialized);
    return {
      filters: Array.isArray(parsed.filters) ? parsed.filters : [],
      operator: parsed.operator === 'OR' ? 'OR' : 'AND',
    };
  } catch (error) {
    console.error('Failed to deserialize filters:', error);
    return { filters: [], operator: 'AND' };
  }
}
