import { EntityId, SelectEntityId } from '@ngrx/signals/entities';
import type { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';

type Rules = DndCharacterModels.Rules.Rules;
type RulesPatch = DndCharacterModels.Rules.RulesPatch;

/** A member's role in a campaign */
export type CampaignRole = 'dm' | 'player';

/** Who may invite: the DMs, or every member */
export type InviteSetting = 'dms' | 'members';

/** What players see of the party: the list (name, class, species, level), or each sheet read-only */
export type PartySheetsSetting = 'summary' | 'full';

export interface AccessSettings {
  invite: InviteSetting;
  party_sheets: PartySheetsSetting;
}

export interface CampaignSettings {
  access: AccessSettings;
}

/** A campaign as the API returns it (go_dnd `api/openapi/src/campaigns.yaml`, `Campaign`) */
export interface CampaignSchema {
  id: string;
  /** a permanent DM */
  owner_id: string;
  name: string;
  description: string;
  /** what its characters are built with: they can't switch these off */
  rules: Rules;
  /** access settings with their defaults filled in; the VTT's later */
  settings: CampaignSettings;
  /** the caller's role */
  role: CampaignRole;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

/** POST /campaigns; rules left out get their defaults */
export interface CampaignCreate {
  name: string;
  description?: string;
  rules?: RulesPatch;
}

/** PATCH /campaigns/{id}; rules and settings.access merge into the current ones */
export interface CampaignPatch {
  name?: string;
  description?: string;
  rules?: RulesPatch;
  settings?: { access?: Partial<AccessSettings> };
}

/** Someone in a campaign */
export interface CampaignMember {
  user_id: string;
  username: string | null;
  profile_picture_url: string | null;
  role: CampaignRole;
  /** the permanent DM */
  owner: boolean;
  /** the caller */
  me: boolean;
  joined_at: string;
}

/** How long an invite (or a character offer) stays open */
export type InviteLifetime = '1h' | '1d' | '7d';

/** One of a campaign's open invites */
export interface CampaignInvite {
  id: string;
  kind: 'link' | 'user';
  /** a user invite's invitee */
  username: string | null;
  invited_by: string | null;
  expires_at: string;
  max_uses: number | null;
  uses: number;
  created_at: string;
}

/** POST /campaigns/{id}/invites: a link, or an invite for one user */
export interface CampaignInviteCreate {
  expires_in?: InviteLifetime;
  /** a link's limit */
  max_uses?: number | null;
  username?: string;
}

export interface CampaignInviteCreated {
  invite: CampaignInvite;
  /** a link's token, shown only now: /dnd/campaigns/join/<token> */
  token: string | null;
}

/** What an invite link is for, before joining */
export interface InviteLinkPreview {
  campaign_id: string;
  campaign_name: string;
  invited_by: string | null;
  expires_at: string;
  /** the caller is already in it */
  member: boolean;
}

/** An invite sent to the caller */
export interface MyInvite {
  id: string;
  campaign_id: string;
  campaign_name: string;
  invited_by: string | null;
  expires_at: string;
  created_at: string;
}

/** POST /campaigns/{id}/characters/{cid}/gifts: modifiers as the boons-and-banes body (added_as is dm) */
export interface CampaignGift {
  items?: { item_id?: string; custom_name?: string; custom_description?: string; quantity?: number; note?: string }[];
  /** coins added */
  currency?: Partial<DndCharacterModels.Characters.Currency>;
  modifiers?: Omit<DndCharacterModels.Characters.CharacterModifierCreate, 'added_as' | 'active'>[];
}

/** A catalog entry a character uses that breaks the campaign's rules */
export interface CharacterIssue {
  /** class, species, background, subclass, feat, spell, item */
  category: string;
  /** the catalog entry's id: the exception approves this */
  id: string;
  name: string;
  reason: string;
  /** the DM accepted it as an exception */
  approved: boolean;
  note: string | null;
}

/** A character in the campaign, with what breaks its current rules */
export interface CampaignCharacter {
  id: string;
  name: string;
  current_level: number;
  owner_id: string;
  owner_username: string | null;
  /** empty before a class is picked */
  class_name: string;
  species_name: string;
  /** for the campaign's DMs and the character's own player; empty for the other players */
  issues: CharacterIssue[];
}

/** GET /campaigns/{id}/characters and the rules preview */
export interface CampaignCharacterList {
  total_entities_count: number;
  entities: CampaignCharacter[];
}

/** The list store's entity id */
export const selectCampaignId: SelectEntityId<CampaignSchema> = (campaign) => campaign.id;

export const selectCampaignIdKey: EntityId = 'id' as keyof CampaignSchema;

/** The campaign page's URL: /dnd/campaigns/:id */
export const campaignRoute = (campaign: Pick<CampaignSchema, 'id'>): string[] => ['/', 'dnd', 'campaigns', campaign.id];
