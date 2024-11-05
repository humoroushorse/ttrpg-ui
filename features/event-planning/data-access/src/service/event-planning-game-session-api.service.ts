import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable, resource, signal } from '@angular/core';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { map, Observable, tap } from 'rxjs';
import { SharedNotificationService } from '@ttrpg-ui/shared/notification/data-access';

@Injectable({
  providedIn: 'root',
})
export class EventPlanningGameSessionApiService {
  readonly sharedNotificationService = inject(SharedNotificationService);

  readonly serviceConfig: EventPlanningModels.Service.EventPlanningApiServiceConfig = inject(
    EventPlanningModels.Service.EVENT_PLANNING_API_SERVICE_CONFIG_TOKEN,
  );

  readonly baseUrl = this.serviceConfig.appConfig().APP_TTRPG_EVENT_PLANNING__API_BASE_PATH;

  readonly http = inject(HttpClient);

  // TODO: go with resources or remove
  getListResourceOptions = signal<EventPlanningModels.GameSession.GetListInput | null>(null);

  // TODO: go with resources or remove
  getListResource = resource({
    request: () => ({ options: this.getListResourceOptions() }),
    loader: ({ request: { options }, abortSignal }) => {
      let params = new HttpParams();
      if (options?.limit) params = params.append('limit', options.limit);
      if (options?.offset) params = params.append('offset', options.offset);
      return fetch(`${this.baseUrl}/game-session${params.toString()}`, {
        signal: abortSignal,
      }).then((res) => res.json() as Promise<EventPlanningModels.GameSession.GameSessionSchema[] | null>);
    },
  });

  getList(
    options?: EventPlanningModels.GameSession.GetListInput,
  ): Observable<EventPlanningModels.GameSession.GameSessionSchema[] | null> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    let params = new HttpParams();
    if (options?.limit) params = params.append('limit', options.limit);
    if (options?.offset) params = params.append('offset', options.offset);
    return this.http
      .get<EventPlanningModels.GameSession.GameSessionSchema[]>(`${this.baseUrl}/game-session`, {
        params,
        headers,
        observe: 'response',
      })
      .pipe(map((r) => r.body));
  }

  get(id: string): Observable<EventPlanningModels.GameSession.GameSessionSchema | null> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http
      .get<EventPlanningModels.GameSession.GameSessionSchema>(`${this.baseUrl}/game-session/${id}`, {
        headers,
        observe: 'response',
      })
      .pipe(map((r) => r.body));
  }

  post(
    options: EventPlanningModels.GameSession.GameSessionPostInput,
  ): Observable<EventPlanningModels.GameSession.GameSessionSchema | null> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http
      .post<EventPlanningModels.GameSession.GameSessionSchema>(`${this.baseUrl}/game-session`, options, {
        headers,
        observe: 'response',
      })
      .pipe(
        map((r) => r.body),
        tap((r) => {
          this.sharedNotificationService.openSnackBar(`Created game session '${r?.title}'`);
        }),
      );
  }

  delete(entity: EventPlanningModels.GameSession.GameSessionSchema): Observable<string | null> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http
      .delete<string>(`${this.baseUrl}/game-session/${entity.id}`, {
        headers,
        observe: 'response',
      })
      .pipe(
        map((r) => r.body),
        tap((r) => {
          if (r) this.sharedNotificationService.openSnackBar(`Deleted game session '${entity.title}'`);
        }),
      );
  }

  postJoinSession(
    entity: EventPlanningModels.GameSession.GameSessionSchema,
    body?: EventPlanningModels.JtUserGameSession.PostJoinSessionInput,
  ): Observable<EventPlanningModels.JtUserGameSession.JtUserGameSessionSchema | null> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http
      .post<EventPlanningModels.JtUserGameSession.JtUserGameSessionSchema>(
        `${this.baseUrl}/game-session/${entity.id}/join-session`,
        body || {},
        {
          headers,
          observe: 'response',
        },
      )
      .pipe(
        map((r) => r.body),
      );
  }

  postLeaveSession(
    entity: EventPlanningModels.GameSession.GameSessionSchema,
    body?: EventPlanningModels.JtUserGameSession.PostJoinSessionInput,
  ): Observable<EventPlanningModels.JtUserGameSession.JtUserGameSessionSchema | null> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http
      .post<EventPlanningModels.JtUserGameSession.JtUserGameSessionSchema>(
        `${this.baseUrl}/game-session/${entity.id}/leave-session`,
        body || {},
        {
          headers,
          observe: 'response',
        },
      )
      .pipe(
        map((r) => r.body),
      );
  }
}
