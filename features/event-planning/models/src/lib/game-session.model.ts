import { EntityId, SelectEntityId } from '@ngrx/signals/entities';
import { GameSystemSchema } from './game-system.model';
import { BookkeepingSchema, UserSchema } from './model';
import { JtUserGameSessionSchema } from './jt-user-game-session.model';

export interface GetListInput {
  limit?: number;
  offset?: number;
}

export interface GameSessionSchema extends BookkeepingSchema {
  id: string;
  game_system_id: string;
  game_system?: GameSystemSchema;
  jt_user_game_session?: JtUserGameSessionSchema[];
  game_master_id: string;
  game_master?: UserSchema;
  title: string;
  description: string;
  start_date: string | Date;
  end_date: string | Date;
  max_players: number;
  image_url?: string;
  image_url_description?: string;
  is_public: boolean;
}

export const selectGameSessionId: SelectEntityId<GameSessionSchema> = (gs) => gs.id;

export const selectGameSessionIdKey: EntityId = "id" as keyof GameSessionSchema;

export interface GameSessionPostInput {
  game_master_id: string;
  title: string;
  description: string;
  game_system_id: string;
  start_date: string | Date;
  end_date: string | Date;
  max_players: number;
  image_url?: string;
  image_url_description?: string;
  is_public: boolean;
}
