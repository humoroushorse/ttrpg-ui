import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

type SprintManagementApiServiceConfig = SprintModels.Service.SprintManagementApiServiceConfig;
const SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN = SprintModels.Service.SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN;
type Project = SprintModels.Project.Project;
type CreateProjectRequest = SprintModels.Project.CreateProjectRequest;
type UpdateProjectRequest = SprintModels.Project.UpdateProjectRequest;
type PaginatedProjectResponse = SprintModels.Project.PaginatedProjectResponse;

@Injectable({
  providedIn: 'root',
})
export class ProjectApiService {
  private readonly http = inject(HttpClient);
  public readonly serviceConfig: SprintManagementApiServiceConfig = inject(
    SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN
  );

  private get baseUrl(): string {
    return this.serviceConfig.appConfig().APP_SPRINT_MANAGEMENT__API_BASE_PATH;
  }

  getProjects(page = 1, pageSize = 25): Observable<PaginatedProjectResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    return this.http.get<PaginatedProjectResponse>(`${this.baseUrl}/projects`, { params });
  }

  getProject(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/projects/${id}`);
  }

  getProjectByKey(key: string): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/projects/key/${key.toUpperCase()}`);
  }

  createProject(request: CreateProjectRequest): Observable<Project> {
    return this.http.post<Project>(`${this.baseUrl}/projects`, request);
  }

  updateProject(id: string, request: UpdateProjectRequest): Observable<Project> {
    return this.http.put<Project>(`${this.baseUrl}/projects/${id}`, request);
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/projects/${id}`);
  }
}
