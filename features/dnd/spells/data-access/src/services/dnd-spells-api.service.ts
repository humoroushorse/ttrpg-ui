import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { DndSpellModels } from '@ttrpg-ui/features/dnd/spells/models';

@Injectable({
  providedIn: 'root',
})
export class DndSpellApiService {
  public readonly serviceConfig: DndSpellModels.Service.DndSpellApiServiceConfig = inject(
    DndSpellModels.Service.DND_SPELL_API_SERVICE_CONFIG_TOKEN,
  );

  private readonly baseUrl = this.serviceConfig.appConfig().APP_TTRPG_DND_SPELL__API_BASE_PATH;

  private readonly http = inject(HttpClient);

  getList(params?: DndSpellModels.Spells.GetListInput): Observable<DndSpellModels.Spells.SpellSchema[] | null> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    let httpParams = new HttpParams();
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.offset) httpParams = httpParams.set('offset', params.offset.toString());

    return this.http
      .get<DndSpellModels.Spells.SpellSchema[]>(`${this.baseUrl}/spells`, {
        headers,
        params: httpParams,
        observe: 'response',
      })
      .pipe(map((r) => r.body ?? []));
  }

  post(body: DndSpellModels.Spells.SpellPostInput): Observable<DndSpellModels.Spells.SpellSchema | null> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http
      .put<DndSpellModels.Spells.SpellSchema>(`${this.baseUrl}/spells`, body, {
        headers,
        observe: 'response',
      })
      .pipe(map((r) => r.body));
  }
}
