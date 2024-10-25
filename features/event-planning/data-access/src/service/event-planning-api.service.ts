import { inject, Injectable } from '@angular/core';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { BehaviorSubject, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventPlanningApiService {
  public serviceConfig: EventPlanningModels.Service.EventPlanningApiServiceConfig = inject(
    EventPlanningModels.Service.EVENT_PLANNING_API_SERVICE_CONFIG_TOKEN,
  );

  private defaultGameSystems: EventPlanningModels.Schemas.GameSessionSchema[] = [
    {
      id: '1',
      game_system_id: '1',
      // game_system?: GameSystemSchema,
      // jt_user_game_session?: JtUserGameSessionSchema,
      game_master_id: 'IanK',
      title: 'Slay dragon',
      description: 'We slay the dragon',
      start_date: new Date(),
      end_date: new Date(),
      max_players: 6,
      image_url: undefined,
      is_public: true,
    },
    {
      id: '2',
      game_system_id: '2',
      // game_system?: GameSystemSchema,
      // jt_user_game_session?: JtUserGameSessionSchema,
      game_master_id: 'Partap',
      title: 'Spooktober Part III',
      description: 'Part three in our Call of Cthulu adventures!',
      start_date: new Date(),
      end_date: new Date(),
      max_players: 6,
      image_url: undefined,
      is_public: true,
    },
    {
      id: '3',
      game_system_id: '1',
      // game_system?: GameSystemSchema,
      // jt_user_game_session?: JtUserGameSessionSchema,
      game_master_id: 'Jeremy B',
      game_master: {
        id: 'some id',
        username: 'Jeremy B',
        profile_picture_url: 'https://material.angular.io/assets/img/examples/shiba2.jpg',
      },
      title: "Granny's Missing Apple Pie",
      description: "Granny's apple pie has gone missing again and she wants help retrieving it",
      start_date: new Date(),
      end_date: new Date(),
      max_players: 6,
      image_url: 'https://material.angular.io/assets/img/examples/shiba2.jpg',
      image_url_description: 'Image of a shiba inu',
      is_public: true,
    },
  ] as const;

  gameSessions = new BehaviorSubject<Map<string, EventPlanningModels.Schemas.GameSessionSchema>>(
    this.defaultGameSystems.reduce((map, gs) => {
      map.set(gs.id, gs);
      return map;
    }, new Map()),
  );

  getGameSystems(): Observable<EventPlanningModels.Schemas.GameSystemSchema[]> {
    return of([
      {
        id: '1',
        name: 'D&D',
        version: '5e (2014)',
        description: 'Dungeons & Dragons 5th edition (2014).',
      },
    ]);
  }

  getGameSessions(): Observable<EventPlanningModels.Schemas.GameSessionSchema[]> {
    return this.gameSessions.pipe(
      map((v) => [
        ...v.values(),
        v.get('1') as unknown as EventPlanningModels.Schemas.GameSessionSchema,
        v.get('1') as unknown as EventPlanningModels.Schemas.GameSessionSchema,
        v.get('1') as unknown as EventPlanningModels.Schemas.GameSessionSchema,
        v.get('1') as unknown as EventPlanningModels.Schemas.GameSessionSchema,
        v.get('1') as unknown as EventPlanningModels.Schemas.GameSessionSchema,
        v.get('1') as unknown as EventPlanningModels.Schemas.GameSessionSchema,
        v.get('3') as unknown as EventPlanningModels.Schemas.GameSessionSchema,
        v.get('3') as unknown as EventPlanningModels.Schemas.GameSessionSchema,
        v.get('1') as unknown as EventPlanningModels.Schemas.GameSessionSchema,
        v.get('1') as unknown as EventPlanningModels.Schemas.GameSessionSchema,
        ...v.values(),
        ...v.values(),
        ...v.values(),
        ...v.values(),
      ]),
    );
  }

  deleteGameSession(id: string): void {
    const v = this.gameSessions.value;
    v.delete(id);
    this.gameSessions.next(v);
  }

  addGameSession(gs: EventPlanningModels.Schemas.GameSessionCreateInput): void {
    const id = Date.now().toString();

    const v = this.gameSessions.value;
    v.set(id, { ...gs, id, game_system_id: '1' });
    this.gameSessions.next(v);
  }

  getGameSessionById(id: string | null): Observable<EventPlanningModels.Schemas.GameSessionSchema | null> {
    if (!id) return of(null);
    return of(this.gameSessions.value.get(id) || null);
  }
}
