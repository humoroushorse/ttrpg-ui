import { computed, inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { DndSpeciesModels } from '@ttrpg-ui/features/dnd/species/models';

type Species = DndSpeciesModels.Species.SpeciesSchema;

/** The API's list response */
interface SpeciesQueryResponse {
  entities?: Species[];
  total_entities_count?: number;
}

/**
 * The fields the list page's columns use (id always comes back). Without `?fields=` the list
 * would carry every entry's big JSON columns.
 */
const LIST_FIELDS: (keyof Species)[] = [
  'source',
  'slug',
  'name',
  'dnd_version_year',
  'is_unearthed_arcana',
  'is_homebrew',
  'creature_type',
  'size',
  'speed',
];

/** The species API: /species under the configured base path */
@Injectable({ providedIn: 'root' })
export class DndSpeciesApiService {
  private readonly config = inject(DndSpeciesModels.Service.DND_SPECIES_API_SERVICE_CONFIG_TOKEN);

  private readonly http = inject(HttpClient);

  // a signal: app.config.json can load after this service is created
  private readonly url = computed(() => `${this.config.appConfig().APP_TTRPG_DND__API_BASE_PATH}/species`);

  /** One page. Sort and filters go as JSON (AG Grid-shaped models), as the shared table emits them */
  getList(query: SharedModels.Store.ListQuery): Observable<SharedModels.Store.ListResponse<Species>> {
    let params = new HttpParams().set('limit', query.limit).set('offset', query.offset);
    if (query.sort) params = params.set('sort', JSON.stringify([query.sort]));
    if (Object.keys(query.filters).length) params = params.set('filter', JSON.stringify(query.filters));
    params = params.set('fields', LIST_FIELDS.join(','));
    return this.http
      .get<SpeciesQueryResponse>(`${this.url()}/query`, { params })
      .pipe(map((r) => ({ entities: r.entities ?? [], total: r.total_entities_count ?? r.entities?.length ?? 0 })));
  }

  getById(id: string): Observable<Species> {
    return this.http.get<Species>(`${this.url()}/${encodeURIComponent(id)}`);
  }

  /** The URL key: the source's slug and the entry's (phb_2024, ...) */
  getBySlugs(sourceSlug: string, slug: string): Observable<Species> {
    const path = [sourceSlug, slug].map(encodeURIComponent).join('/');
    return this.http.get<Species>(`${this.url()}/${path}`);
  }
}
