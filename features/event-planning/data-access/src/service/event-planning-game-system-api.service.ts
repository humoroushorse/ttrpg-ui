import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable, resource, signal } from '@angular/core';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventPlanningGameSystemApiService {

  readonly serviceConfig: EventPlanningModels.Service.EventPlanningApiServiceConfig = inject(
    EventPlanningModels.Service.EVENT_PLANNING_API_SERVICE_CONFIG_TOKEN,
  );

  readonly baseUrl = this.serviceConfig.appConfig().APP_TTRPG_EVENT_PLANNING__API_BASE_PATH;

  readonly http = inject(HttpClient);

  // TODO: go with resources or remove
  getListResourceOptions = signal<EventPlanningModels.GameSystem.GetListInput | null>(null);

  // TODO: go with resources or remove
  getListResource = resource({
    request: () => ({ options: this.getListResourceOptions() }),
    loader: ({ request: { options }, abortSignal }) => {
      let params = new HttpParams();
      if (options?.limit) params = params.append('limit', options.limit);
      if (options?.offset) params = params.append('offset', options.offset);
      return fetch(`${this.baseUrl}/game-system${params.toString()}`, {
        signal: abortSignal,
      }).then((res) => res.json() as Promise<EventPlanningModels.GameSystem.GameSystemSchema[] | null>);
    },
  });

  getList(
    options?: EventPlanningModels.GameSystem.GetListInput,
  ): Observable<EventPlanningModels.GameSystem.GameSystemSchema[] | null> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    let params = new HttpParams();
    if (options?.limit) params = params.append('limit', options.limit);
    if (options?.offset) params = params.append('offset', options.offset);
    return this.http
      .get<EventPlanningModels.GameSystem.GameSystemSchema[]>(`${this.baseUrl}/game-system`, {
        params,
        headers,
        observe: 'response',
      })
      .pipe(map((r) => r.body));
  }

  get(id: string): Observable<EventPlanningModels.GameSystem.GameSystemSchema | null> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http
      .get<EventPlanningModels.GameSystem.GameSystemSchema>(`${this.baseUrl}/game-system/${id}`, {
        headers,
        observe: 'response',
      })
      .pipe(map((r) => r.body));
  }

  post(
    options: EventPlanningModels.GameSystem.GameSystemPostInput,
  ): Observable<EventPlanningModels.GameSystem.GameSystemSchema | null> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http
      .post<EventPlanningModels.GameSystem.GameSystemSchema>(`${this.baseUrl}/game-system`, options, {
        headers,
        observe: 'response',
      })
      .pipe(
        map((r) => r.body),
      );
  }

  delete(entity: EventPlanningModels.GameSystem.GameSystemSchema): Observable<string | null> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http
      .delete<string>(`${this.baseUrl}/game-system/${entity.id}`, {
        headers,
        observe: 'response',
      })
      .pipe(
        map((r) => r.body),
      );
  }
}
