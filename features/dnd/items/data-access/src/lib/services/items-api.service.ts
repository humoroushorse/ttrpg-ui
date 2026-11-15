import { computed, inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { DndItemModels } from '@ttrpg-ui/features/dnd/items/models';

type Item = DndItemModels.Items.ItemSchema;

/** The API's list response */
interface ItemQueryResponse {
  entities?: Item[];
  total_entities_count?: number;
}

/**
 * The fields the list page's columns use (id always comes back). Without `?fields=` the list
 * would carry every entry's big JSON columns.
 */
const LIST_FIELDS: (keyof Item)[] = [
  'source',
  'slug',
  'name',
  'dnd_version_year',
  'is_unearthed_arcana',
  'is_homebrew',
  'category',
  'subcategory',
  'is_magic',
  'rarity',
  'requires_attunement',
  'magic_item_type',
  'cost',
  'weight',
];

/** The items API: /items under the configured base path */
@Injectable({ providedIn: 'root' })
export class DndItemApiService {
  private readonly config = inject(DndItemModels.Service.DND_ITEM_API_SERVICE_CONFIG_TOKEN);

  private readonly http = inject(HttpClient);

  // a signal: app.config.json can load after this service is created
  private readonly url = computed(() => `${this.config.appConfig().APP_TTRPG_DND__API_BASE_PATH}/items`);

  /** One page. Sort and filters go as JSON (AG Grid-shaped models), as the shared table emits them */
  getList(query: SharedModels.Store.ListQuery): Observable<SharedModels.Store.ListResponse<Item>> {
    let params = new HttpParams().set('limit', query.limit).set('offset', query.offset);
    if (query.sort) params = params.set('sort', JSON.stringify([query.sort]));
    if (Object.keys(query.filters).length) params = params.set('filter', JSON.stringify(query.filters));
    params = params.set('fields', LIST_FIELDS.join(','));
    return this.http
      .get<ItemQueryResponse>(`${this.url()}/query`, { params })
      .pipe(map((r) => ({ entities: r.entities ?? [], total: r.total_entities_count ?? r.entities?.length ?? 0 })));
  }

  getById(id: string): Observable<Item> {
    return this.http.get<Item>(`${this.url()}/${encodeURIComponent(id)}`);
  }

  /** The URL key: the source's slug and the entry's (phb_2024, ...) */
  getBySlugs(sourceSlug: string, slug: string): Observable<Item> {
    const path = [sourceSlug, slug].map(encodeURIComponent).join('/');
    return this.http.get<Item>(`${this.url()}/${path}`);
  }
}
