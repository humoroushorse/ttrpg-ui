import { EntityId, SelectEntityId } from '@ngrx/signals/entities';
import { SharedModels } from '@ttrpg-ui/shared/models';

export interface GetListInput {
  limit?: number;
  offset?: number;
}

export interface SpellSchema extends SharedModels.Schemas.BookkeepingSchema {
  id: string;
  name: string;
}

export const selectSpellId: SelectEntityId<SpellSchema> = (gs) => gs.id;

export const selectSpellIdKey: EntityId = 'id' as keyof SpellSchema;

export interface SpellPostInput {
  name: string;
}
