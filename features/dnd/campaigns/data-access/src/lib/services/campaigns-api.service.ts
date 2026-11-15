import { computed, inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { DndCampaignModels } from '@ttrpg-ui/features/dnd/campaigns/models';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';

type Campaign = DndCampaignModels.Campaigns.CampaignSchema;
type CampaignCharacter = DndCampaignModels.Campaigns.CampaignCharacter;
type CampaignCharacterList = DndCampaignModels.Campaigns.CampaignCharacterList;
type CharacterDetail = DndCharacterModels.Characters.CharacterDetail;
type Rules = DndCharacterModels.Rules.Rules;
type RulesPatch = DndCharacterModels.Rules.RulesPatch;

/** The members, invites and invite lists' shape */
export interface Entities<T> {
  entities: T[];
}

/** The API's list response */
interface CampaignQueryResponse {
  entities?: Campaign[];
  total_entities_count?: number;
}

/** The campaigns API: /campaigns under the configured base path. Lists the campaigns the caller is in */
@Injectable({ providedIn: 'root' })
export class DndCampaignApiService {
  private readonly config = inject(DndCampaignModels.Service.DND_CAMPAIGN_API_SERVICE_CONFIG_TOKEN);

  private readonly http = inject(HttpClient);

  // a signal: app.config.json can load after this service is created
  private readonly url = computed(() => `${this.config.appConfig().APP_TTRPG_DND__API_BASE_PATH}/campaigns`);

  /** One page, by name (the API doesn't sort or filter campaigns) */
  getList(query: SharedModels.Store.ListQuery): Observable<SharedModels.Store.ListResponse<Campaign>> {
    const params = new HttpParams().set('limit', query.limit).set('offset', query.offset);
    return this.http
      .get<CampaignQueryResponse>(`${this.url()}/query`, { params })
      .pipe(map((r) => ({ entities: r.entities ?? [], total: r.total_entities_count ?? r.entities?.length ?? 0 })));
  }

  getById(id: string): Observable<Campaign> {
    return this.http.get<Campaign>(this.campaignUrl(id));
  }

  create(body: DndCampaignModels.Campaigns.CampaignCreate): Observable<Campaign> {
    return this.http.post<Campaign>(this.url(), body);
  }

  patch(id: string, body: DndCampaignModels.Campaigns.CampaignPatch): Observable<Campaign> {
    return this.http.patch<Campaign>(this.campaignUrl(id), body);
  }

  /** Soft delete. Returns the id. */
  delete(id: string): Observable<string> {
    return this.http.delete<string>(this.campaignUrl(id));
  }

  /** The rules a new campaign starts with */
  getDefaultRules(): Observable<Rules> {
    return this.http.get<Rules>(`${this.url()}/rules/defaults`);
  }

  /** The campaign's characters, each with what breaks its current rules */
  getCharacters(id: string): Observable<CampaignCharacterList> {
    return this.http.get<CampaignCharacterList>(`${this.campaignUrl(id)}/characters`);
  }

  /** What a rules change (merged like a PATCH) would flag; saves nothing */
  previewRules(id: string, rules: RulesPatch): Observable<CampaignCharacterList> {
    return this.http.post<CampaignCharacterList>(`${this.campaignUrl(id)}/rules/preview`, rules);
  }

  /** A 409 with `issues` when the character breaks the campaign's rules; nothing is linked then */
  addCharacter(id: string, characterId: string): Observable<CharacterDetail> {
    return this.http.post<CharacterDetail>(`${this.characterUrl(id, characterId)}`, null);
  }

  /** The character leaves the campaign (back to its own rules) */
  removeCharacter(id: string, characterId: string): Observable<CharacterDetail> {
    return this.http.delete<CharacterDetail>(this.characterUrl(id, characterId));
  }

  /** The DM accepts a catalog entry the character uses that breaks the rules */
  approveException(id: string, characterId: string, refId: string, note?: string): Observable<CampaignCharacter> {
    return this.http.put<CampaignCharacter>(this.exceptionUrl(id, characterId, refId), { note: note ?? null });
  }

  revokeException(id: string, characterId: string, refId: string): Observable<CampaignCharacter> {
    return this.http.delete<CampaignCharacter>(this.exceptionUrl(id, characterId, refId));
  }

  // --- members ---

  getMembers(id: string): Observable<Entities<DndCampaignModels.Campaigns.CampaignMember>> {
    return this.http.get<Entities<DndCampaignModels.Campaigns.CampaignMember>>(`${this.campaignUrl(id)}/members`);
  }

  /** DMs make a member a DM or a player (never the owner) */
  setMemberRole(id: string, userId: string, role: DndCampaignModels.Campaigns.CampaignRole) {
    return this.http.patch<Entities<DndCampaignModels.Campaigns.CampaignMember>>(this.memberUrl(id, userId), { role });
  }

  /** Leave (your own id) or remove someone (DMs). Their characters leave the campaign too */
  removeMember(id: string, userId: string) {
    return this.http.delete<Entities<DndCampaignModels.Campaigns.CampaignMember>>(this.memberUrl(id, userId));
  }

  // --- invites ---

  getInvites(id: string): Observable<Entities<DndCampaignModels.Campaigns.CampaignInvite>> {
    return this.http.get<Entities<DndCampaignModels.Campaigns.CampaignInvite>>(`${this.campaignUrl(id)}/invites`);
  }

  createInvite(id: string, body: DndCampaignModels.Campaigns.CampaignInviteCreate) {
    return this.http.post<DndCampaignModels.Campaigns.CampaignInviteCreated>(`${this.campaignUrl(id)}/invites`, body);
  }

  revokeInvite(id: string, inviteId: string) {
    return this.http.delete<Entities<DndCampaignModels.Campaigns.CampaignInvite>>(
      `${this.campaignUrl(id)}/invites/${encodeURIComponent(inviteId)}`,
    );
  }

  /** A 404 for a made-up link, a 410 for an expired, revoked or used-up one */
  previewInviteLink(token: string): Observable<DndCampaignModels.Campaigns.InviteLinkPreview> {
    return this.http.get<DndCampaignModels.Campaigns.InviteLinkPreview>(this.linkUrl(token));
  }

  acceptInviteLink(token: string): Observable<Campaign> {
    return this.http.post<Campaign>(`${this.linkUrl(token)}/accept`, null);
  }

  /** Invites sent to the caller, to campaigns they aren't in */
  getMyInvites(): Observable<Entities<DndCampaignModels.Campaigns.MyInvite>> {
    return this.http.get<Entities<DndCampaignModels.Campaigns.MyInvite>>(this.invitesUrl());
  }

  acceptInvite(inviteId: string): Observable<Campaign> {
    return this.http.post<Campaign>(`${this.invitesUrl()}/${encodeURIComponent(inviteId)}/accept`, null);
  }

  declineInvite(inviteId: string): Observable<Entities<DndCampaignModels.Campaigns.MyInvite>> {
    return this.http.post<Entities<DndCampaignModels.Campaigns.MyInvite>>(
      `${this.invitesUrl()}/${encodeURIComponent(inviteId)}/decline`,
      null,
    );
  }

  /** A DM gives a character in the campaign items, coins and boons or banes */
  give(id: string, characterId: string, body: DndCampaignModels.Campaigns.CampaignGift): Observable<CharacterDetail> {
    return this.http.post<CharacterDetail>(`${this.characterUrl(id, characterId)}/gifts`, body);
  }

  private base(): string {
    return this.config.appConfig().APP_TTRPG_DND__API_BASE_PATH;
  }

  private memberUrl(id: string, userId: string): string {
    return `${this.campaignUrl(id)}/members/${encodeURIComponent(userId)}`;
  }

  private linkUrl(token: string): string {
    return `${this.base()}/invite-links/${encodeURIComponent(token)}`;
  }

  private invitesUrl(): string {
    return `${this.base()}/invites`;
  }

  private campaignUrl(id: string): string {
    return `${this.url()}/${encodeURIComponent(id)}`;
  }

  private characterUrl(id: string, characterId: string): string {
    return `${this.campaignUrl(id)}/characters/${encodeURIComponent(characterId)}`;
  }

  private exceptionUrl(id: string, characterId: string, refId: string): string {
    return `${this.characterUrl(id, characterId)}/exceptions/${encodeURIComponent(refId)}`;
  }
}
