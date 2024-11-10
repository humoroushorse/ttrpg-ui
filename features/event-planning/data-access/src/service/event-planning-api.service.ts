import { inject, Injectable } from '@angular/core';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { map, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class EventPlanningApiService {
  readonly authService = inject(AuthService)

  readonly serviceConfig: EventPlanningModels.Service.EventPlanningApiServiceConfig = inject(
    EventPlanningModels.Service.EVENT_PLANNING_API_SERVICE_CONFIG_TOKEN,
  );

  readonly baseUrl = this.serviceConfig.appConfig().APP_TTRPG_EVENT_PLANNING__API_BASE_PATH;

  readonly http = inject(HttpClient);

  getCurrentUser(): Observable<EventPlanningModels.Schemas.UserSchema | null> {
    const currentUserId = this.authService.getUserTokenDecoded()()?.sub
    if (!currentUserId) return of(null);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http
      .get<EventPlanningModels.Schemas.UserSchema>(`${this.baseUrl}/user/${currentUserId}`, {
        headers,
        observe: 'response',
      })
      .pipe(map((r) => r.body));
  }

  updateCurrentUser(body: EventPlanningModels.Schemas.PutUserInput): Observable<EventPlanningModels.Schemas.UserSchema | null> {
    const currentUserId = this.authService.getUserTokenDecoded()()?.sub
    if (!currentUserId) return of(null);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http
      .put<EventPlanningModels.Schemas.UserSchema>(
        `${this.baseUrl}/user/${currentUserId}`,
        body,
        {
          headers,
          observe: 'response',
        }
      )
      .pipe(map((r) => r.body));
  }
}
