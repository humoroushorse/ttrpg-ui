import { computed, inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DndSpellModels } from '@ttrpg-ui/features/dnd/spells/models';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { TableModels } from '@ttrpg-ui/shared/table/models';

type Spell = DndSpellModels.Spells.SpellSchema;

interface SpellQueryResponse {
  entities?: Spell[];
  /** py_dnd */
  total_entities_count?: number;
  /** go_dnd */
  total?: number;
}

interface SourceQueryResponse {
  entities?: { slug: string; name: string; dnd_version_year: number }[];
  total_entities_count?: number;
  total?: number;
}

/** Every printing of a spell fits in one page */
const VERSIONS_LIMIT = 100;

@Injectable({
  providedIn: 'root',
})
export class DndSpellApiService {
  private readonly serviceConfig: DndSpellModels.Service.DndSpellApiServiceConfig = inject(
    DndSpellModels.Service.DND_SPELL_API_SERVICE_CONFIG_TOKEN,
  );

  private readonly http = inject(HttpClient);

  // a signal: app.config.json can load after this service is created
  private readonly baseUrl = computed(() => this.serviceConfig.appConfig().APP_TTRPG_DND__API_BASE_PATH);

  private readonly spellsUrl = computed(() => `${this.baseUrl()}/spells`);

  /** One page. Sort and filters go as AG Grid's models (JSON); the API breaks ties by name, then newest edition. */
  getList(query: SharedModels.Store.ListQuery): Observable<SharedModels.Store.ListResponse<Spell>> {
    let params = new HttpParams().set('limit', query.limit).set('offset', query.offset);
    if (query.sort) params = params.set('sort', JSON.stringify([query.sort]));
    if (Object.keys(query.filters).length) params = params.set('filter', JSON.stringify(query.filters));
    return this.query(params);
  }

  /** A page of sources for a source filter: value is the slug the spell filter takes */
  getSourceOptions(query: TableModels.SetFilterPageQuery): Observable<TableModels.SetFilterPage> {
    let params = new HttpParams().set('limit', query.limit).set('offset', query.offset);
    if (query.search) params = params.set('name', query.search);
    return this.http.get<SourceQueryResponse>(`${this.baseUrl()}/sources/query`, { params }).pipe(
      map((r) => ({
        options: (r.entities ?? []).map((s) => ({ value: s.slug, label: `${s.name} (${s.dnd_version_year})` })),
        total: r.total_entities_count ?? r.total ?? 0,
      })),
    );
  }

  getById(id: string): Observable<Spell> {
    return this.http.get<Spell>(`${this.spellsUrl()}/${id}`);
  }

  /** The URL key: the source's slug and the spell's (phb_2024, acid-splash) */
  getBySlugs(sourceSlug: string, slug: string): Observable<Spell> {
    const path = [sourceSlug, slug].map(encodeURIComponent).join('/');
    return this.http.get<Spell>(`${this.spellsUrl()}/${path}`);
  }

  /** Every printing of a spell, across sources and editions */
  getVersions(slug: string): Observable<Spell[]> {
    const params = new HttpParams().set('versions_of', slug).set('limit', VERSIONS_LIMIT);
    return this.query(params).pipe(map((r) => r.entities));
  }

  create(body: DndSpellModels.Spells.SpellWrite): Observable<Spell> {
    return this.http.post<Spell>(this.spellsUrl(), body);
  }

  /** Fields left out go back to their defaults */
  replace(id: string, body: DndSpellModels.Spells.SpellWrite): Observable<Spell> {
    return this.http.put<Spell>(`${this.spellsUrl()}/${id}`, body);
  }

  patch(id: string, body: DndSpellModels.Spells.SpellPatch): Observable<Spell> {
    return this.http.patch<Spell>(`${this.spellsUrl()}/${id}`, body);
  }

  /** Soft delete. Returns the id. */
  delete(id: string): Observable<string> {
    return this.http.delete<string>(`${this.spellsUrl()}/${id}`);
  }

  private query(params: HttpParams): Observable<SharedModels.Store.ListResponse<Spell>> {
    return this.http.get<SpellQueryResponse>(`${this.spellsUrl()}/query`, { params }).pipe(
      map((r) => ({
        entities: r.entities ?? [],
        total: r.total_entities_count ?? r.total ?? r.entities?.length ?? 0,
      })),
    );
  }
}
