import { GameSessionSchema } from './game-session.model';
import { BookkeepingSchema } from './model';
import { EntityId, SelectEntityId } from '@ngrx/signals/entities';

export interface GetListInput {
  limit?: number;
  offset?: number;
}

export interface GameSystemSchema extends BookkeepingSchema {
  id: string;
  game_sessions?: GameSessionSchema[];
  name: string;
  version: string;
  release_year: number;
  description: string;
}

export const selectGameSystemId: SelectEntityId<GameSystemSchema> = (gs) => gs.id;

export const selectGameSystemIdKey: EntityId = "id" as keyof GameSystemSchema;

export interface GameSystemPostInput {
  name: string;
  version: string;
  release_year: number;
  description: string;
}
