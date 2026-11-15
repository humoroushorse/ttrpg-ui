import { computed, inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';

type Character = DndCharacterModels.Characters.CharacterSchema;
type CharacterDetail = DndCharacterModels.Characters.CharacterDetail;
type CharacterSheet = DndCharacterModels.Sheet.CharacterSheet;

/** The API's list response */
interface CharacterQueryResponse {
  entities?: Character[];
  total_entities_count?: number;
}

/**
 * The caller's characters: /characters under the configured base path. Every route needs a login,
 * and someone else's character is a 404. A write answers with the whole character.
 */
@Injectable({ providedIn: 'root' })
export class DndCharacterApiService {
  private readonly config = inject(DndCharacterModels.Service.DND_CHARACTER_API_SERVICE_CONFIG_TOKEN);

  private readonly http = inject(HttpClient);

  // a signal: app.config.json can load after this service is created
  private readonly url = computed(() => `${this.config.appConfig().APP_TTRPG_DND__API_BASE_PATH}/characters`);

  /** One page, by name. The API takes no sort or filters here. */
  getList(query: SharedModels.Store.ListQuery): Observable<SharedModels.Store.ListResponse<Character>> {
    const params = new HttpParams().set('limit', query.limit).set('offset', query.offset);
    return this.http
      .get<CharacterQueryResponse>(`${this.url()}/query`, { params })
      .pipe(map((r) => ({ entities: r.entities ?? [], total: r.total_entities_count ?? r.entities?.length ?? 0 })));
  }

  /** The character with its whole build: levels, choices, items, prepared spells, modifiers */
  getById(id: string): Observable<CharacterDetail> {
    return this.http.get<CharacterDetail>(`${this.url()}/${encodeURIComponent(id)}`);
  }

  /** The computed sheet at its current level, or at `level` to preview another planned level */
  getSheet(id: string, level?: number): Observable<CharacterSheet> {
    const params = level ? new HttpParams().set('level', level) : undefined;
    return this.http.get<CharacterSheet>(`${this.url()}/${encodeURIComponent(id)}/sheet`, { params });
  }

  create(body: DndCharacterModels.Characters.CharacterCreate): Observable<CharacterDetail> {
    return this.http.post<CharacterDetail>(this.url(), body);
  }

  /** With `version`, the API refuses the write (409) if the character changed since */
  patch(id: string, body: DndCharacterModels.Characters.CharacterPatch, version?: number): Observable<CharacterDetail> {
    return this.http.patch<CharacterDetail>(`${this.url()}/${encodeURIComponent(id)}`, body, {
      headers: version === undefined ? undefined : new HttpHeaders({ 'If-Match': String(version) }),
    });
  }

  /** Soft delete. Returns the id. */
  delete(id: string): Observable<string> {
    return this.http.delete<string>(`${this.url()}/${encodeURIComponent(id)}`);
  }

  // --- the build. Each write answers with the whole character; `version` sends If-Match ---

  /** Catalog entries for a pick, with the rules applied: each says whether it's allowed and why not */
  getOptions(id: string, kind: DndCharacterModels.Build.OptionKind, query: DndCharacterModels.Build.OptionsQuery = {}) {
    let params = new HttpParams().set('limit', query.limit ?? 500).set('offset', query.offset ?? 0);
    if (query.slot) params = params.set('slot', query.slot);
    if (query.level) params = params.set('level', query.level);
    if (query.name) params = params.set('name', query.name);
    if (query.filtersOff) params = params.set('filters', 'off');
    if (query.allowed) params = params.set('allowed', true);
    return this.http.get<DndCharacterModels.Build.CharacterOptions>(`${this.characterUrl(id)}/options/${kind}`, {
      params,
    });
  }

  /** The sheet as it would be after these changes, at `level` (default current_level); nothing is saved */
  preview(
    id: string,
    operations: DndCharacterModels.Build.SheetOperation[],
    level?: number,
  ): Observable<CharacterSheet> {
    const params = level ? new HttpParams().set('level', level) : undefined;
    return this.http.post<CharacterSheet>(`${this.characterUrl(id)}/sheet/preview`, { operations }, { params });
  }

  addChoice(id: string, body: DndCharacterModels.Build.ChoiceBody, version?: number): Observable<CharacterDetail> {
    return this.http.post<CharacterDetail>(`${this.characterUrl(id)}/choices`, body, this.ifMatch(version));
  }

  /** The whole choice. Choices it granted stay linked to it */
  replaceChoice(id: string, choiceId: string, body: DndCharacterModels.Build.ChoiceBody, version?: number) {
    return this.http.put<CharacterDetail>(`${this.characterUrl(id)}/choices/${choiceId}`, body, this.ifMatch(version));
  }

  /** A 409 while the choice still has choices it granted */
  deleteChoice(id: string, choiceId: string, version?: number): Observable<CharacterDetail> {
    return this.http.delete<CharacterDetail>(`${this.characterUrl(id)}/choices/${choiceId}`, this.ifMatch(version));
  }

  /** Plans a level (only the next one, or a planned one to change) */
  setLevel(id: string, level: number, body: DndCharacterModels.Build.LevelBody, version?: number) {
    return this.http.put<CharacterDetail>(`${this.characterUrl(id)}/levels/${level}`, body, this.ifMatch(version));
  }

  /** Drops the top planned level (lowering current_level keeps the plan instead) */
  deleteLevel(id: string, level: number, version?: number): Observable<CharacterDetail> {
    return this.http.delete<CharacterDetail>(`${this.characterUrl(id)}/levels/${level}`, this.ifMatch(version));
  }

  /** Rolls the class's hit die for a planned level (2 or higher); rerolls are kept, the newest counts */
  rollLevelHp(id: string, level: number, version?: number): Observable<CharacterDetail> {
    return this.http.post<CharacterDetail>(
      `${this.characterUrl(id)}/levels/${level}/hp-roll`,
      {},
      this.ifMatch(version),
    );
  }

  /** A cantrip or spell from the class's list, within the rules; over the class's limit is allowed (the sheet warns) */
  prepareSpell(id: string, spellId: string, version?: number): Observable<CharacterDetail> {
    return this.http.put<CharacterDetail>(
      `${this.characterUrl(id)}/prepared-spells/${encodeURIComponent(spellId)}`,
      {},
      this.ifMatch(version),
    );
  }

  unprepareSpell(id: string, spellId: string, version?: number): Observable<CharacterDetail> {
    return this.http.delete<CharacterDetail>(
      `${this.characterUrl(id)}/prepared-spells/${encodeURIComponent(spellId)}`,
      this.ifMatch(version),
    );
  }

  /** A catalog item (item_id) or a custom one (custom_name) */
  addItem(id: string, body: DndCharacterModels.Characters.CharacterItemCreate, version?: number) {
    return this.http.post<CharacterDetail>(`${this.characterUrl(id)}/items`, body, this.ifMatch(version));
  }

  updateItem(id: string, itemId: string, body: DndCharacterModels.Characters.CharacterItemPatch, version?: number) {
    return this.http.patch<CharacterDetail>(
      `${this.characterUrl(id)}/items/${encodeURIComponent(itemId)}`,
      body,
      this.ifMatch(version),
    );
  }

  deleteItem(id: string, itemId: string, version?: number): Observable<CharacterDetail> {
    return this.http.delete<CharacterDetail>(
      `${this.characterUrl(id)}/items/${encodeURIComponent(itemId)}`,
      this.ifMatch(version),
    );
  }

  /** A boon or bane (+1 AC from the DM, a −2 Str curse, Mage Armor) */
  addModifier(id: string, body: DndCharacterModels.Characters.CharacterModifierCreate, version?: number) {
    return this.http.post<CharacterDetail>(`${this.characterUrl(id)}/modifiers`, body, this.ifMatch(version));
  }

  /** `{ active: false }` switches one off */
  updateModifier(
    id: string,
    modifierId: string,
    body: DndCharacterModels.Characters.CharacterModifierPatch,
    version?: number,
  ): Observable<CharacterDetail> {
    return this.http.patch<CharacterDetail>(
      `${this.characterUrl(id)}/modifiers/${encodeURIComponent(modifierId)}`,
      body,
      this.ifMatch(version),
    );
  }

  deleteModifier(id: string, modifierId: string, version?: number): Observable<CharacterDetail> {
    return this.http.delete<CharacterDetail>(
      `${this.characterUrl(id)}/modifiers/${encodeURIComponent(modifierId)}`,
      this.ifMatch(version),
    );
  }

  // --- editors and hand-overs ---

  /** Who the owner lets edit the character (the owner and its editors see this) */
  getEditors(id: string): Observable<{ entities: DndCharacterModels.Characters.CharacterEditor[] }> {
    return this.http.get<{ entities: DndCharacterModels.Characters.CharacterEditor[] }>(
      `${this.characterUrl(id)}/editors`,
    );
  }

  addEditor(id: string, who: DndCharacterModels.Characters.SomeUser) {
    return this.http.post<{ entities: DndCharacterModels.Characters.CharacterEditor[] }>(
      `${this.characterUrl(id)}/editors`,
      who,
    );
  }

  /** The owner takes someone off, or an editor takes themselves off */
  removeEditor(id: string, userId: string) {
    return this.http.delete<{ entities: DndCharacterModels.Characters.CharacterEditor[] }>(
      `${this.characterUrl(id)}/editors/${encodeURIComponent(userId)}`,
    );
  }

  getTransfer(id: string): Observable<{ transfer: DndCharacterModels.Characters.CharacterTransfer | null }> {
    return this.http.get<{ transfer: DndCharacterModels.Characters.CharacterTransfer | null }>(
      `${this.characterUrl(id)}/transfer`,
    );
  }

  /** Offer the character to someone (a member of its campaign, when it's in one); replaces an earlier offer */
  offerTransfer(id: string, body: DndCharacterModels.Characters.CharacterTransferOffer) {
    return this.http.put<{ transfer: DndCharacterModels.Characters.CharacterTransfer | null }>(
      `${this.characterUrl(id)}/transfer`,
      body,
    );
  }

  cancelTransfer(id: string) {
    return this.http.delete<{ transfer: DndCharacterModels.Characters.CharacterTransfer | null }>(
      `${this.characterUrl(id)}/transfer`,
    );
  }

  /** Characters offered to the caller */
  getIncomingTransfers(): Observable<{ entities: DndCharacterModels.Characters.IncomingTransfer[] }> {
    return this.http.get<{ entities: DndCharacterModels.Characters.IncomingTransfer[] }>(this.transfersUrl());
  }

  acceptTransfer(characterId: string): Observable<CharacterDetail> {
    return this.http.post<CharacterDetail>(`${this.transfersUrl()}/${encodeURIComponent(characterId)}/accept`, null);
  }

  declineTransfer(characterId: string) {
    return this.http.post<{ entities: DndCharacterModels.Characters.IncomingTransfer[] }>(
      `${this.transfersUrl()}/${encodeURIComponent(characterId)}/decline`,
      null,
    );
  }

  private transfersUrl(): string {
    return `${this.config.appConfig().APP_TTRPG_DND__API_BASE_PATH}/character-transfers`;
  }

  /** Catalog items whose name contains `name`, for adding to the inventory */
  searchItems(name: string): Observable<DndCharacterModels.Characters.CatalogItemRef[]> {
    const params = new HttpParams()
      .set('name', name)
      .set('limit', 25)
      .set('fields', 'name,slug,source_slug,dnd_version_year,category,subcategory');
    const base = this.config.appConfig().APP_TTRPG_DND__API_BASE_PATH;
    return this.http
      .get<{ entities?: DndCharacterModels.Characters.CatalogItemRef[] }>(`${base}/items/query`, { params })
      .pipe(map((r) => r.entities ?? []));
  }

  setAbilityScores(id: string, body: DndCharacterModels.Build.AbilityScoresBody, version?: number) {
    return this.http.put<CharacterDetail>(`${this.characterUrl(id)}/ability-scores`, body, this.ifMatch(version));
  }

  /** Rolls a new set of six (4d6, drop the lowest) on the server */
  rollAbilityScores(id: string, version?: number): Observable<CharacterDetail> {
    return this.http.post<CharacterDetail>(`${this.characterUrl(id)}/ability-rolls`, {}, this.ifMatch(version));
  }

  private characterUrl(id: string): string {
    return `${this.url()}/${encodeURIComponent(id)}`;
  }

  private ifMatch(version?: number): { headers?: HttpHeaders } {
    return version === undefined ? {} : { headers: new HttpHeaders({ 'If-Match': String(version) }) };
  }
}
