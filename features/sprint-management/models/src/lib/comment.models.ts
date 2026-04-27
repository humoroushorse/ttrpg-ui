import { User } from './work-item.models';

export interface Comment {
  id: string;
  work_item_id: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export interface CommentWithAuthor extends Comment {
  author?: User;
}
