import type { AbilityCode, AbilityMethod, AbilityScores, ChoiceKind, HpMethod } from './characters.model';

/** The kinds GET /characters/{id}/options/{kind} lists */
export type OptionKind = 'species' | 'background' | 'class' | 'subclass' | 'feat' | 'spell';

export interface OptionsQuery {
  /** a choice point's slot: its own filter applies (Origin feats, Wizard cantrips) */
  slot?: string;
  /** the level to check against (default current_level) */
  level?: number;
  /** name contains, any case */
  name?: string;
  /** list rule-breaking entries as allowed, with the reasons as warnings (own rules only) */
  filtersOff?: boolean;
  /** only allowed entries, plus the ones the character has */
  allowed?: boolean;
  limit?: number;
  offset?: number;
}

/** A catalog entry for a pick */
export interface CharacterOption {
  id: string;
  name: string;
  slug: string;
  source_slug: string;
  dnd_version_year: number;
  allowed: boolean;
  /** why it isn't allowed (with filters off: why it would break the rules) */
  reasons?: string[];
  /** the character already has it */
  chosen: boolean;
  /** a feat's category */
  category?: string;
  /** a spell's level */
  level?: number;
  /** a spell to prepare that's in the spellbook (the spellbook rule) */
  learned?: boolean;
}

export interface CharacterOptions {
  kind: OptionKind;
  slot: string | null;
  level: number;
  total_entities_count: number;
  entities: CharacterOption[];
}

/** POST/PUT /characters/{id}/choices */
export interface ChoiceBody {
  level: number;
  kind: ChoiceKind;
  slot: string;
  granted_by_id?: string | null;
  species_id?: string;
  subclass_id?: string;
  background_id?: string;
  feat_id?: string;
  spell_id?: string;
  value?: Record<string, unknown>;
  overrides_filter?: boolean;
}

/** PUT /characters/{id}/levels/{level} */
export interface LevelBody {
  /** required for a new level */
  class_id?: string;
  /** rolled comes from the HP roll route */
  hp_method?: Exclude<HpMethod, 'rolled'>;
  hp_value?: number | null;
}

/** PUT /characters/{id}/ability-scores */
export interface AbilityScoresBody {
  method: AbilityMethod;
  scores: AbilityScores;
  /** rolled: the index of the kept set in ability_rolls */
  rolled_set?: number | null;
}

/** One change for POST /characters/{id}/sheet/preview, as its own route takes it */
export interface SheetOperation {
  op:
    | 'choice.add'
    | 'choice.replace'
    | 'choice.remove'
    | 'level.set'
    | 'level.remove'
    | 'scores.set'
    | 'character.update';
  choice_id?: string;
  level?: number;
  body?: object;
}

/** The field of a choice's value that holds the pick, by kind (go_dnd `valueKey`) */
export const VALUE_KEY: Partial<Record<ChoiceKind, string>> = {
  skill: 'skill',
  expertise: 'skill',
  tool: 'tool',
  language: 'language',
  saving_throw: 'ability',
  resistance: 'damage_type',
  option: 'option',
  spellcasting_ability: 'ability',
  equipment_option: 'option',
};

/** The kinds a choice picks a catalog row for, and its field */
export const REF_FIELD: Partial<Record<ChoiceKind, keyof ChoiceBody>> = {
  species: 'species_id',
  background: 'background_id',
  subclass: 'subclass_id',
  feat: 'feat_id',
  spell: 'spell_id',
};

export const DAMAGE_TYPES = [
  'acid',
  'bludgeoning',
  'cold',
  'fire',
  'force',
  'lightning',
  'necrotic',
  'piercing',
  'poison',
  'psychic',
  'radiant',
  'slashing',
  'thunder',
];

/** The 2024 PHB's point buy costs (the API checks the budget; this only shows what's left) */
export const POINT_BUY_COST: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export type ScoreMethod = AbilityMethod;

export const ALL_ABILITIES: AbilityCode[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
