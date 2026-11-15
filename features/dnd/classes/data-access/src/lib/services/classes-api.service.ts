import { computed, inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { DndClassModels } from '@ttrpg-ui/features/dnd/classes/models';

type Class = DndClassModels.Classes.ClassSchema;

/** The API's list response */
interface ClassQueryResponse {
  entities?: Class[];
  total_entities_count?: number;
}

/**
 * The fields the list page's columns use (id always comes back). Without `?fields=` the list
 * would carry every entry's big JSON columns.
 */
const LIST_FIELDS: (keyof Class)[] = [
  'source',
  'slug',
  'name',
  'dnd_version_year',
  'is_unearthed_arcana',
  'is_homebrew',
  'hit_die_size',
  'primary_ability',
  'spellcasting_ability',
  'caster_progression',
];

/** The classes API: /classes under the configured base path */
@Injectable({ providedIn: 'root' })
export class DndClassApiService {
  private readonly config = inject(DndClassModels.Service.DND_CLASS_API_SERVICE_CONFIG_TOKEN);

  private readonly http = inject(HttpClient);

  // a signal: app.config.json can load after this service is created
  private readonly url = computed(() => `${this.config.appConfig().APP_TTRPG_DND__API_BASE_PATH}/classes`);

  /** One page. Sort and filters go as JSON (AG Grid-shaped models), as the shared table emits them */
  getList(query: SharedModels.Store.ListQuery): Observable<SharedModels.Store.ListResponse<Class>> {
    let params = new HttpParams().set('limit', query.limit).set('offset', query.offset);
    if (query.sort) params = params.set('sort', JSON.stringify([query.sort]));
    if (Object.keys(query.filters).length) params = params.set('filter', JSON.stringify(query.filters));
    params = params.set('fields', LIST_FIELDS.join(','));
    return this.http
      .get<ClassQueryResponse>(`${this.url()}/query`, { params })
      .pipe(map((r) => ({ entities: r.entities ?? [], total: r.total_entities_count ?? r.entities?.length ?? 0 })));
  }

  getById(id: string): Observable<Class> {
    return this.http.get<Class>(`${this.url()}/${encodeURIComponent(id)}`);
  }

  /** The URL key: the source's slug and the entry's (phb_2024, ...) */
  getBySlugs(sourceSlug: string, slug: string): Observable<Class> {
    const path = [sourceSlug, slug].map(encodeURIComponent).join('/');
    return this.http.get<Class>(`${this.url()}/${path}`);
  }
}
