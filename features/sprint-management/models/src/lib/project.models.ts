export interface Project {
  id: string;
  key: string;
  name: string;
  description: string;
  current_counter: number;
  starting_number: number;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  key: string;
  name: string;
  description?: string;
  starting_number?: number;
}

export interface UpdateProjectRequest {
  name: string;
  description?: string;
}

export interface PaginatedProjectResponse {
  items: Project[];
  page: number;
  page_size: number;
  total: number;
}
