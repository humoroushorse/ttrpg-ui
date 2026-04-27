export interface TimeEntry {
  id: string;
  work_item_id: string;
  user_id: string;
  hours: number;
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface TimeEntryWithUser extends TimeEntry {
  user?: {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export interface TimeTrackingSummary {
  work_item_id: string;
  estimated_hours: number | null;
  logged_hours: number;
  remaining_hours: number | null;
  entries: TimeEntryWithUser[];
}

export interface CreateTimeEntryRequest {
  work_item_id: string;
  hours: number;
  description: string;
  date: string;
}

export interface UpdateTimeEntryRequest {
  id: string;
  hours?: number;
  description?: string;
  date?: string;
}
