import { computed, inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { DndBackgroundModels } from '@ttrpg-ui/features/dnd/backgrounds/models';

type Background = DndBackgroundModels.Backgrounds.BackgroundSchema;

/** The API's list response */
interface BackgroundQueryResponse {
  entities?: Background[];
  total_entities_count?: number;
}

/**
 * The fields the list page's columns use (id always comes back). Without `?fields=` the list
 * would carry every entry's big JSON columns.
 */
const LIST_FIELDS: (keyof Background)[] = [
  'source',
  'slug',
  'name',
  'dnd_version_year',
  'is_unearthed_arcana',
  'is_homebrew',
  'ability_score_bonuses',
  'feat',
  'skill_proficiencies',
  'tool_proficiencies',
];

/** The backgrounds API: /backgrounds under the configured base path */
@Injectable({ providedIn: 'root' })
export class DndBackgroundApiService {
  private readonly config = inject(DndBackgroundModels.Service.DND_BACKGROUND_API_SERVICE_CONFIG_TOKEN);

  private readonly http = inject(HttpClient);

  // a signal: app.config.json can load after this service is created
  private readonly url = computed(() => `${this.config.appConfig().APP_TTRPG_DND__API_BASE_PATH}/backgrounds`);

  /** One page. Sort and filters go as JSON (AG Grid-shaped models), as the shared table emits them */
  getList(query: SharedModels.Store.ListQuery): Observable<SharedModels.Store.ListResponse<Background>> {
    let params = new HttpParams().set('limit', query.limit).set('offset', query.offset);
    if (query.sort) params = params.set('sort', JSON.stringify([query.sort]));
    if (Object.keys(query.filters).length) params = params.set('filter', JSON.stringify(query.filters));
    params = params.set('fields', LIST_FIELDS.join(','));
    return this.http
      .get<BackgroundQueryResponse>(`${this.url()}/query`, { params })
      .pipe(map((r) => ({ entities: r.entities ?? [], total: r.total_entities_count ?? r.entities?.length ?? 0 })));
  }

  getById(id: string): Observable<Background> {
    return this.http.get<Background>(`${this.url()}/${encodeURIComponent(id)}`);
  }

  /** The URL key: the source's slug and the entry's (phb_2024, ...) */
  getBySlugs(sourceSlug: string, slug: string): Observable<Background> {
    const path = [sourceSlug, slug].map(encodeURIComponent).join('/');
    return this.http.get<Background>(`${this.url()}/${path}`);
  }
}
