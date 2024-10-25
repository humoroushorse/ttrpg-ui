export interface JtUserGameSessionSchema {
  id: string;
  game_session_id: string;
  game_session?: GameSessionSchema;
  user_id: string;
}

export interface GameSessionSchema {
  id: string;
  game_system_id: string;
  game_system?: GameSystemSchema;
  jt_user_game_session?: JtUserGameSessionSchema;
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

export interface GameSessionCreateInput {
  game_master_id: string;
  title: string;
  description: string;
  start_date: string | Date;
  end_date: string | Date;
  max_players: number;
  image_url?: string;
  image_url_description?: string;
  is_public: boolean;
}

export interface GameSystemSchema {
  id: string;
  game_sessions?: GameSessionSchema[];
  name: string;
  version: string;
  description: string;
}

export interface UserSchema {
  id: string;
  jt_user_game_session?: JtUserGameSessionSchema[];
  username: string;
  profile_picture_url?: string;
}
