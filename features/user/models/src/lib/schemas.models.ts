export interface UserSchema {
  id: string;
  username: string;
  profile_picture_url?: string;
}

export interface PutUserInput {
  profile_picture_url?: string;
}
