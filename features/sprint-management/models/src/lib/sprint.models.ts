import { WorkItem } from './work-item.models';

export enum SprintStatus {
  Planning = 'planned',
  Active = 'active',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export interface Sprint {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: SprintStatus;
  goal: string | null;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
}

export interface SprintWithMetrics extends Sprint {
  work_items?: WorkItem[];
  total_items: number;
  completed_items: number;
  in_progress_items: number;
  blocked_items: number;
  total_story_points: number;
  completed_story_points: number;
  velocity: number | null;
}
