import { GameSessionSchema } from './game-session.model';
import { UserSchema } from './model';

export interface JtUserGameSessionSchema {
  id: string;
  game_session_id: string;
  game_session?: GameSessionSchema;
  user_id: string;
  user?: UserSchema;
}

export interface PostJoinSessionInput {
  user_id?: string;
  game_session_id: string;
}

export interface PostLeaveSessionInput {
  user_id?: string;
  game_session_id: string;
}
