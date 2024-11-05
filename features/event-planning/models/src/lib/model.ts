import { JtUserGameSessionSchema } from './jt-user-game-session.model';

export interface BookkeepingSchemaCreate {
  created_at: Date | string;
  created_by: string;
}

export interface BookkeepingSchemaUpdate {
  updated_at: Date | string;
  updated_by: string;
}

export type BookkeepingSchema = BookkeepingSchemaCreate & BookkeepingSchemaUpdate;

export interface UserSchema {
  id: string;
  jt_user_game_session?: JtUserGameSessionSchema[];
  username: string;
  profile_picture_url?: string;
}
