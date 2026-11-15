import type { AbilityMethod, HpMethod } from './characters.model';

/** The catalog categories the rules filter */
export type RuleCategory = 'species' | 'class' | 'subclass' | 'background' | 'feat' | 'spell' | 'item';

/** When the other edition's entries are allowed: never, only where the base edition has none, always */
export type OtherEditionMode = 'never' | 'if_missing' | 'always';

export interface OptionalRules {
  feats: boolean;
  custom_origin: boolean;
  optional_class_features: boolean;
  encumbrance: 'off' | 'standard' | 'variant';
  multiclass_prerequisites: boolean;
  /** a class with a spellbook (Wizard) learns its spells into it at each level and prepares from it */
  spellbook: boolean;
}

/** A campaign's or character's rule set (go_dnd `internal/rules`, `CampaignRules`) */
export interface Rules {
  schema_version: number;
  /** the base edition */
  edition: 2024 | 2014;
  other_edition: { default: OtherEditionMode; by_category: Partial<Record<RuleCategory, OtherEditionMode>> };
  allow_unearthed_arcana: boolean;
  allow_playtest: boolean;
  /** source slugs; allow null is every source */
  sources: { allow: string[] | null; block: string[] };
  ability_score_methods: AbilityMethod[];
  ability_score_default: AbilityMethod;
  point_buy_budget: number;
  rolled_sets_kept: number;
  hp_methods: HpMethod[];
  hp_default: HpMethod;
  optional_rules: OptionalRules;
}

/** A PATCH merges into the character's own rules, so any part of them */
export type RulesPatch = Partial<Omit<Rules, 'optional_rules'>> & { optional_rules?: Partial<OptionalRules> };
