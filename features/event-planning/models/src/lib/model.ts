import { JtUserGameSessionSchema } from './jt-user-game-session.model';

export interface UserSchema {
  id: string;
  jt_user_game_session?: JtUserGameSessionSchema[];
  username: string;
  profile_picture_url?: string;
}

export interface PutUserInput {
  profile_picture_url?: string;
}
