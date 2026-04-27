import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN = SprintModels.Service.SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN;
const { SprintStatus } = SprintModels.Sprint;
const { DependencyType } = SprintModels.Dependency;
const { FilterType, FilterCondition } = SprintModels.Filter;

type SprintManagementApiServiceConfig = SprintModels.Service.SprintManagementApiServiceConfig;
type WorkItem = SprintModels.WorkItem.WorkItem;
type Sprint = SprintModels.Sprint.Sprint;
type Dependency = SprintModels.Dependency.Dependency;
type Comment = SprintModels.Comment.Comment;
type PaginatedRequest = SprintModels.Api.PaginatedRequest;
type PaginatedResponse<T> = SprintModels.Api.PaginatedResponse<T>;
type CreateWorkItemRequest = SprintModels.Api.CreateWorkItemRequest;
type UpdateWorkItemRequest = SprintModels.Api.UpdateWorkItemRequest;
type CreateSprintRequest = SprintModels.Api.CreateSprintRequest;
type UpdateSprintRequest = SprintModels.Api.UpdateSprintRequest;
type BulkUpdateRequest = SprintModels.Api.BulkUpdateRequest;
type SearchWorkItemsRequest = SprintModels.Api.SearchWorkItemsRequest;
type DependencyType = SprintModels.Dependency.DependencyType;
type FilterType = SprintModels.Filter.FilterType;
type FilterCondition = SprintModels.Filter.FilterCondition;
import { SharedDateService } from '@ttrpg-ui/shared/date/data-access';

@Injectable({
  providedIn: 'root',
})
export class SprintManagementApiService {
  private readonly http = inject(HttpClient);
  private readonly dateService = inject(SharedDateService);
  public readonly serviceConfig: SprintManagementApiServiceConfig = inject(SPRINT_MANAGEMENT_API_SERVICE_CONFIG_TOKEN);

  private get baseUrl(): string {
    return this.serviceConfig.appConfig().APP_SPRINT_MANAGEMENT__API_BASE_PATH;
  }

  private readonly mockCustomFields: SprintModels.CustomField.CustomFieldDefinition[] = [
    {
      key: 'story_category',
      label: 'Story Category',
      type: SprintModels.CustomField.CustomFieldType.Select,
      options: ['Frontend', 'Backend', 'DevOps', 'Design'],
      placeholder: 'Select category',
    },
    {
      key: 'complexity_score',
      label: 'Complexity Score',
      type: SprintModels.CustomField.CustomFieldType.Number,
      placeholder: '1-10',
      helpText: 'Rate complexity from 1 to 10',
    },
    { key: 'due_date_override', label: 'Due Date Override', type: SprintModels.CustomField.CustomFieldType.Date },
    {
      key: 'affected_components',
      label: 'Affected Components',
      type: SprintModels.CustomField.CustomFieldType.MultiSelect,
      options: ['Auth', 'API', 'UI', 'Database', 'Infrastructure'],
    },
    {
      key: 'needs_review',
      label: 'Needs Design Review',
      type: SprintModels.CustomField.CustomFieldType.Checkbox,
      defaultValue: false,
    },
    {
      key: 'external_ticket',
      label: 'External Ticket ID',
      type: SprintModels.CustomField.CustomFieldType.Text,
      placeholder: 'e.g. JIRA-1234',
    },
  ];

  getCustomFieldDefinitions(): Observable<SprintModels.CustomField.CustomFieldDefinition[]> {
    return of(this.mockCustomFields);
  }

  private readonly mockTemplates: SprintModels.Template.WorkItemTemplate[] = [
    {
      id: 'tpl-bug',
      name: 'Bug Report',
      description: 'Template for reporting bugs and defects',
      type: SprintModels.WorkItem.WorkItemType.Defect,
      defaultPriority: SprintModels.WorkItem.WorkItemPriority.High,
      defaultTags: ['bug', 'needs-triage'],
      descriptionTemplate: '## Steps to Reproduce\n\n## Expected Behavior\n\n## Actual Behavior\n\n## Environment\n',
      customFields: [
        {
          key: 'affected_components',
          label: 'Affected Components',
          type: SprintModels.CustomField.CustomFieldType.MultiSelect,
          options: ['Auth', 'API', 'UI', 'Database', 'Infrastructure'],
        },
        {
          key: 'needs_review',
          label: 'Needs Design Review',
          type: SprintModels.CustomField.CustomFieldType.Checkbox,
          defaultValue: false,
        },
      ],
    },
    {
      id: 'tpl-feature',
      name: 'Feature Request',
      description: 'Template for new feature development',
      type: SprintModels.WorkItem.WorkItemType.Story,
      defaultPriority: SprintModels.WorkItem.WorkItemPriority.Medium,
      defaultTags: ['feature', 'enhancement'],
      descriptionTemplate: '## User Story\nAs a user, I want to...\n\n## Acceptance Criteria\n\n## Technical Notes\n',
      customFields: [
        {
          key: 'story_category',
          label: 'Story Category',
          type: SprintModels.CustomField.CustomFieldType.Select,
          options: ['Frontend', 'Backend', 'DevOps', 'Design'],
        },
        {
          key: 'complexity_score',
          label: 'Complexity Score',
          type: SprintModels.CustomField.CustomFieldType.Number,
          placeholder: '1-10',
        },
      ],
    },
    {
      id: 'tpl-task',
      name: 'General Task',
      description: 'Template for general development tasks',
      type: SprintModels.WorkItem.WorkItemType.Story,
      defaultPriority: SprintModels.WorkItem.WorkItemPriority.Medium,
      defaultTags: ['task'],
      descriptionTemplate: '## Objective\n\n## Definition of Done\n',
      customFields: [],
    },
  ];

  getWorkItemTemplates(): Observable<SprintModels.Template.WorkItemTemplate[]> {
    return of(this.mockTemplates);
  }

  getWorkItems(request: PaginatedRequest): Observable<PaginatedResponse<WorkItem>> {
    const params = this.buildPaginatedParams(request);
    return this.http.get<PaginatedResponse<WorkItem>>(`${this.baseUrl}/workitems`, { params });
  }

  getWorkItem(id: string): Observable<WorkItem> {
    return this.http.get<WorkItem>(`${this.baseUrl}/workitems/${id}`);
  }

  createWorkItem(request: CreateWorkItemRequest): Observable<WorkItem> {
    return this.http.post<WorkItem>(`${this.baseUrl}/workitems`, request);
  }

  updateWorkItem(id: string, request: UpdateWorkItemRequest): Observable<WorkItem> {
    return this.http.put<WorkItem>(`${this.baseUrl}/workitems/${id}`, request);
  }

  deleteWorkItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/workitems/${id}`);
  }

  bulkUpdateWorkItems(request: BulkUpdateRequest): Observable<WorkItem[]> {
    return this.http.post<WorkItem[]>(`${this.baseUrl}/workitems/bulk-update`, request);
  }

  searchWorkItems(request: SearchWorkItemsRequest): Observable<PaginatedResponse<WorkItem>> {
    return this.http.post<PaginatedResponse<WorkItem>>(`${this.baseUrl}/workitems/search`, request);
  }

  getSprints(request: PaginatedRequest): Observable<PaginatedResponse<Sprint>> {
    const params = this.buildPaginatedParams(request);
    return this.http.get<PaginatedResponse<Sprint>>(`${this.baseUrl}/sprints`, { params });
  }

  getSprint(id: string): Observable<Sprint> {
    return this.http.get<Sprint>(`${this.baseUrl}/sprints/${id}`);
  }

  createSprint(request: CreateSprintRequest): Observable<Sprint> {
    // Get user's timezone from date service
    const userTimezone = this.dateService.timezone();

    return this.http.post<Sprint>(`${this.baseUrl}/sprints`, request, {
      headers: {
        'X-User-Timezone': userTimezone,
      },
    });
  }

  updateSprint(id: string, request: UpdateSprintRequest): Observable<Sprint> {
    return this.http.put<Sprint>(`${this.baseUrl}/sprints/${id}`, request);
  }

  deleteSprint(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sprints/${id}`);
  }

  startSprint(id: string): Observable<Sprint> {
    return this.updateSprint(id, { id, status: SprintStatus.Active });
  }

  completeSprint(id: string): Observable<Sprint> {
    return this.updateSprint(id, { id, status: SprintStatus.Completed });
  }

  searchSprints(query: string, pageSize = 25): Observable<PaginatedResponse<Sprint>> {
    const params = this.buildPaginatedParams({
      page: 1,
      page_size: pageSize,
      filters: [
        {
          field: 'search',
          type: FilterType.Text,
          condition: FilterCondition.Contains,
          value: query,
        },
      ],
    });
    return this.http.get<PaginatedResponse<Sprint>>(`${this.baseUrl}/sprints`, { params });
  }

  getDependencies(workItemId: string): Observable<Dependency[]> {
    return this.http.get<Dependency[]>(`${this.baseUrl}/workitems/${workItemId}/dependencies`);
  }

  createDependency(workItemId: string, targetId: string, type: DependencyType): Observable<Dependency> {
    return this.http.post<Dependency>(`${this.baseUrl}/workitems/${workItemId}/dependencies`, {
      target_work_item_id: targetId,
      dependency_type: type,
    });
  }

  deleteDependency(workItemId: string, dependencyId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/workitems/${workItemId}/dependencies/${dependencyId}`);
  }

  getComments(workItemId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}/workitems/${workItemId}/comments`);
  }

  createComment(workItemId: string, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${this.baseUrl}/workitems/${workItemId}/comments`, { content });
  }

  updateComment(workItemId: string, commentId: string, content: string): Observable<Comment> {
    return this.http.put<Comment>(`${this.baseUrl}/workitems/${workItemId}/comments/${commentId}`, { content });
  }

  deleteComment(workItemId: string, commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/workitems/${workItemId}/comments/${commentId}`);
  }

  exportWorkItems(format: 'csv' | 'json', request: PaginatedRequest): Observable<Blob> {
    const params = this.buildPaginatedParams(request);
    return this.http.get(`${this.baseUrl}/workitems/export/${format}`, {
      params,
      responseType: 'blob',
    });
  }

  addTag(workItemId: string, tag: string): Observable<SprintModels.WorkItem.WorkItem> {
    return this.http.post<SprintModels.WorkItem.WorkItem>(`${this.baseUrl}/workitems/${workItemId}/tags`, { tag });
  }

  removeTag(workItemId: string, tag: string): Observable<SprintModels.WorkItem.WorkItem> {
    return this.http.delete<SprintModels.WorkItem.WorkItem>(
      `${this.baseUrl}/workitems/${workItemId}/tags/${encodeURIComponent(tag)}`,
    );
  }

  getTags(workItemId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/workitems/${workItemId}/tags`);
  }

  getTimeEntries(workItemId: string): Observable<SprintModels.TimeTracking.TimeEntry[]> {
    return this.http.get<SprintModels.TimeTracking.TimeEntry[]>(`${this.baseUrl}/workitems/${workItemId}/time-entries`);
  }

  createTimeEntry(
    request: SprintModels.TimeTracking.CreateTimeEntryRequest,
  ): Observable<SprintModels.TimeTracking.TimeEntry> {
    return this.http.post<SprintModels.TimeTracking.TimeEntry>(
      `${this.baseUrl}/workitems/${request.work_item_id}/time-entries`,
      request,
    );
  }

  updateTimeEntry(
    workItemId: string,
    request: SprintModels.TimeTracking.UpdateTimeEntryRequest,
  ): Observable<SprintModels.TimeTracking.TimeEntry> {
    return this.http.put<SprintModels.TimeTracking.TimeEntry>(
      `${this.baseUrl}/workitems/${workItemId}/time-entries/${request.id}`,
      request,
    );
  }

  deleteTimeEntry(workItemId: string, entryId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/workitems/${workItemId}/time-entries/${entryId}`);
  }

  getWorkItemLinks(workItemId: string): Observable<SprintModels.WorkItemLink.WorkItemLink[]> {
    return of(
      this.mockWorkItemLinks.filter(
        (l) => l.source_work_item_id === workItemId || l.target_work_item_id === workItemId,
      ),
    );
  }

  createWorkItemLink(
    request: SprintModels.WorkItemLink.CreateWorkItemLinkRequest,
  ): Observable<SprintModels.WorkItemLink.WorkItemLink> {
    const link: SprintModels.WorkItemLink.WorkItemLink = {
      id: `link-${Date.now()}`,
      source_work_item_id: request.source_work_item_id,
      target_work_item_id: request.target_work_item_id,
      link_type: request.link_type,
      created_by: 'current-user',
      created_at: new Date().toISOString(),
    };
    this.mockWorkItemLinks.push(link);
    return of(link);
  }

  deleteWorkItemLink(id: string): Observable<void> {
    const idx = this.mockWorkItemLinks.findIndex((l) => l.id === id);
    if (idx !== -1) {
      this.mockWorkItemLinks.splice(idx, 1);
    }
    return of(void 0);
  }

  private mockWorkItemLinks: SprintModels.WorkItemLink.WorkItemLink[] = [];

  getAuditLogs(filters: any): Observable<any[]> {
    let params = new HttpParams();

    if (filters.entity_type) {
      params = params.set('entity_type', filters.entity_type);
    }
    if (filters.entity_id) {
      params = params.set('entity_id', filters.entity_id);
    }
    if (filters.user_id) {
      params = params.set('user_id', filters.user_id);
    }
    if (filters.action) {
      params = params.set('action', filters.action);
    }
    if (filters.start_date) {
      params = params.set('start_date', filters.start_date);
    }
    if (filters.end_date) {
      params = params.set('end_date', filters.end_date);
    }

    return this.http.get<any[]>(`${this.baseUrl}/audit-logs`, { params });
  }

  private buildPaginatedParams(request: PaginatedRequest): HttpParams {
    let params = new HttpParams()
      .set('page', (request.page ?? 1).toString())
      .set('page_size', (request.page_size ?? 25).toString());

    if (request.filters && request.filters.length > 0) {
      params = params.set('filters', JSON.stringify(request.filters));
    }

    if (request.sort && request.sort.length > 0) {
      params = params.set('sort', JSON.stringify(request.sort));
    }

    return params;
  }
}
