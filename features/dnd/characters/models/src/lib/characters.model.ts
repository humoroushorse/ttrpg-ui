import { EntityId, SelectEntityId } from '@ngrx/signals/entities';
import type { Rules, RulesPatch } from './rules.model';

export type AbilityCode = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export type AbilityScores = Record<AbilityCode, number>;

export type AbilityMethod = 'point_buy' | 'standard_array' | 'rolled' | 'manual';

/** Level 1 is always the hit die's maximum; rolled comes only from the HP roll route */
export type HpMethod = 'average' | 'rolled' | 'manual';

export type Coin = 'cp' | 'sp' | 'ep' | 'gp' | 'pp';

export type Currency = Record<Coin, number>;

export interface CharacterDetails {
  alignment?: string;
  appearance?: string;
  backstory?: string;
  personality?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  portrait?: string;
}

/** The kinds of pick a choice can be (go_dnd `choiceKinds`) */
export type ChoiceKind =
  | 'species'
  | 'subclass'
  | 'background'
  | 'feat'
  | 'asi'
  | 'skill'
  | 'expertise'
  | 'tool'
  | 'language'
  | 'fighting_style'
  | 'equipment_option'
  | 'spell'
  | 'saving_throw'
  | 'resistance'
  | 'spellcasting_ability'
  | 'option';

/** A rolled set of ability scores, as ability_rolls keeps them */
export interface AbilityRoll {
  at: string;
  /** six rolls of 4d6 */
  dice: number[][];
  /** each roll's total without its lowest die */
  totals: number[];
  origin: string;
}

/** A character as the list returns it (go_dnd `api/openapi/dnd.yaml`, `Character`) */
export interface CharacterSchema {
  id: string;
  owner_id: string;
  name: string;
  campaign_id: string | null;
  current_level: number;
  /** the rule set in force: the campaign's, or the character's own */
  rules: Rules;
  rules_from: 'campaign' | 'character';
  ability_method: AbilityMethod;
  base_scores: Partial<AbilityScores>;
  /** the kept sets, newest last */
  ability_rolls: AbilityRoll[];
  ability_roll_count: number;
  currency: Currency;
  details: CharacterDetails;
  /** bumped by every write; send it as If-Match to refuse a stale write */
  version: number;
  /** what the caller may do with it (the list fills in owner and editor only) */
  viewer?: CharacterViewer;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

/** What the caller may do with a character */
export interface CharacterViewer {
  owner: boolean;
  editor: boolean;
  /** in its campaign; empty when not in it */
  campaign_role: 'dm' | 'player' | '';
  can_edit: boolean;
  /** give items, coins, boons and banes (its campaign's DMs) */
  can_give?: boolean;
  /** delete it, choose its editors, hand it over, move it between campaigns (its owner) */
  can_manage?: boolean;
}

/** One roll of a level's hit die */
export interface HpRoll {
  value: number;
  die: number;
  at: string;
  origin: string;
}

/** One planned level */
export interface CharacterLevel {
  id: string;
  level: number;
  class: { id: string; slug: string; name: string; dnd_version_year: number; source_slug: string };
  hp_method: HpMethod;
  hp_value: number | null;
  /** every roll, rerolls too; the newest is hp_value */
  hp_rolls: HpRoll[] | null;
}

/** One pick the player made, at the level it was made; `slot` names the choice point it answers */
export interface CharacterChoice {
  id: string;
  level: number;
  kind: ChoiceKind;
  slot: string;
  /** the choice that made this one possible (background -> its feat -> the feat's picks) */
  granted_by_id: string | null;
  species_id: string | null;
  subclass_id: string | null;
  background_id: string | null;
  feat_id: string | null;
  spell_id: string | null;
  item_id: string | null;
  /** the picked catalog entry's name */
  ref_name?: string;
  /** picks that aren't catalog rows: { skill }, { increases: { int: 2 } }, { ability }, { option }, { tool } */
  value: Record<string, unknown> | null;
  /** picked with the character's own rules switched off */
  overrides_filter: boolean;
}

export interface CharacterItem {
  id: string;
  item_id: string | null;
  item_name: string | null;
  item_slug: string | null;
  custom_name: string | null;
  custom_description: string | null;
  quantity: number;
  equipped: boolean;
  attuned: boolean;
  /** hidden while current_level is below it */
  level_received: number | null;
  note: string | null;
  /** a campaign DM's gift: a custom one's name and description are the DMs' to change */
  given_by?: string | null;
  given_campaign_id?: string | null;
  granted_by_id: string | null;
}

/** POST /characters/{id}/items: item_id or custom_name */
export interface CharacterItemCreate {
  item_id?: string;
  custom_name?: string;
  quantity?: number;
  equipped?: boolean;
}

/** PATCH /characters/{id}/items/{item_id} */
export type CharacterItemPatch = Partial<
  Pick<CharacterItem, 'quantity' | 'equipped' | 'attuned' | 'note' | 'custom_name' | 'custom_description'>
>;

/** A catalog item as the item search lists it */
export interface CatalogItemRef {
  id: string;
  name: string;
  slug: string;
  source_slug: string;
  dnd_version_year: number;
  category: string | null;
  subcategory: string | null;
}

export interface CharacterPreparedSpell {
  spell_id: string;
  class_id: string;
  spell_name: string;
  spell_slug: string;
  spell_level: number;
  class_slug: string;
}

/** What a boon or bane does to its target (go_dnd `modifierOps`) */
export type ModifierOp =
  | 'add'
  | 'set'
  | 'base'
  | 'min'
  | 'max'
  | 'adv'
  | 'disadv'
  | 'resist'
  | 'immune'
  | 'vuln'
  | 'condition_immune'
  | 'grant';

/** A boon or bane */
export interface CharacterModifier {
  id: string;
  label: string;
  note: string | null;
  /** a path: ac, ability.str, skill.stealth, save.dex, speed.walk, hp.max, initiative, ... */
  target: string;
  op: ModifierOp;
  value: unknown;
  from_level: number | null;
  active: boolean;
  added_as: 'player' | 'dm';
  /** given by this campaign's DM: it counts only while the character is in it, and only its DMs change it */
  campaign_id?: string | null;
}

/** POST /characters/{id}/modifiers */
export interface CharacterModifierCreate {
  label: string;
  note?: string | null;
  target: string;
  op: ModifierOp;
  /** 2, -1, "fire", { value: 13, add_dex: true } */
  value: unknown;
  /** applies from this level up (an item found at 5) */
  from_level?: number | null;
  active?: boolean;
  added_as?: 'player' | 'dm';
}

/** PATCH /characters/{id}/modifiers/{modifier_id} */
export type CharacterModifierPatch = Partial<Omit<CharacterModifierCreate, 'added_as'>>;

/** A character with its whole build: what GET /characters/{id} and every write answer with */
export interface CharacterDetail extends CharacterSchema {
  levels: CharacterLevel[];
  choices: CharacterChoice[];
  items: CharacterItem[];
  prepared_spells: CharacterPreparedSpell[];
  modifiers: CharacterModifier[];
}

/** POST /characters; ability method and base scores start from the rules' default (point buy, all 8s) */
export interface CharacterCreate {
  name: string;
  campaign_id?: string | null;
  current_level?: number;
  details?: CharacterDetails;
}

/** PATCH /characters/{id}; rules merge into the character's own */
export interface CharacterPatch {
  name?: string;
  current_level?: number;
  currency?: Partial<Currency>;
  details?: CharacterDetails;
  rules?: RulesPatch;
  /** changes the class on every planned level */
  class_id?: string;
}

/** The list store's entity id */
export const selectCharacterId: SelectEntityId<CharacterSchema> = (character) => character.id;

export const selectCharacterIdKey: EntityId = 'id' as keyof CharacterSchema;

/** The character sheet's URL: /dnd/characters/:id */
export const characterRoute = (character: Pick<CharacterSchema, 'id'>): string[] => [
  '/',
  'dnd',
  'characters',
  character.id,
];

/** Someone the owner lets edit the character */
export interface CharacterEditor {
  user_id: string;
  username: string | null;
  profile_picture_url: string | null;
  added_at: string;
  /** the caller */
  me: boolean;
}

/** A user named by id or username (someone who has signed in) */
export interface SomeUser {
  user_id?: string;
  username?: string;
}

/** The owner's pending offer to hand the character over */
export interface CharacterTransfer {
  to_user_id: string;
  to_username: string | null;
  expires_at: string;
  created_at: string;
}

/** PUT /characters/{id}/transfer */
export interface CharacterTransferOffer extends SomeUser {
  expires_in?: '1h' | '1d' | '7d';
}

/** A character offered to the caller */
export interface IncomingTransfer {
  character_id: string;
  character_name: string;
  current_level: number;
  from_username: string | null;
  campaign_id: string | null;
  campaign_name: string | null;
  expires_at: string;
  created_at: string;
}
