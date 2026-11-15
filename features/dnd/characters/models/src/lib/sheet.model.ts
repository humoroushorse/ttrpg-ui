import type { AbilityCode, ChoiceKind } from './characters.model';

export type SkillCode =
  | 'acrobatics'
  | 'animal_handling'
  | 'arcana'
  | 'athletics'
  | 'deception'
  | 'history'
  | 'insight'
  | 'intimidation'
  | 'investigation'
  | 'medicine'
  | 'nature'
  | 'perception'
  | 'performance'
  | 'persuasion'
  | 'religion'
  | 'sleight_of_hand'
  | 'stealth'
  | 'survival';

export type SpeedKind = 'walk' | 'fly' | 'swim' | 'climb' | 'burrow';

export type SenseKind = 'darkvision' | 'blindsight' | 'tremorsense' | 'truesight';

export type PassiveSkill = 'insight' | 'investigation' | 'perception';

export type ProficiencyKind = 'armor' | 'weapons' | 'tools' | 'languages';

export const PROFICIENCY_KINDS: ProficiencyKind[] = ['armor', 'weapons', 'tools', 'languages'];

/**
 * The computed sheet (GET /characters/{id}/sheet, go_dnd `CharacterSheet`). Every number carries
 * the contributions that made it, so a breakdown needs no rules logic of its own.
 */

/** One part of a number: "Background: Soldier +2" */
export interface Contribution {
  source: string;
  /** set: becomes; min: at least; max: at most */
  op: 'base' | 'add' | 'set' | 'min' | 'max';
  value: number;
  /** "half proficiency bonus"; for an inactive one, why it doesn't apply ("not worn") */
  note?: string;
}

export interface Stat {
  value: number;
  contributions: Contribution[];
  /** parts that would apply but don't right now (armor not worn, a switched-off bane) */
  inactive?: Contribution[];
  roll?: 'advantage' | 'disadvantage' | 'normal';
  /** what gives advantage / disadvantage */
  advantage?: string[];
  disadvantage?: string[];
}

export interface SavingThrow extends Stat {
  proficient?: boolean;
}

/** What a skill's bonus adds: half is Jack of All Trades; expertise only counts with proficiency */
export type ProficiencyLevel = 'none' | 'half' | 'proficient' | 'expertise';

export interface Skill extends Stat {
  ability: AbilityCode;
  proficient: boolean;
  /** picked; see proficiency for whether it counts */
  expertise: boolean;
  proficiency: ProficiencyLevel;
}

/** A pick the build asks for. Choices with this slot (and one of these kinds) answer it. */
export interface ChoicePoint {
  slot: string;
  kinds: ChoiceKind[];
  /** "Bard", "Background: Entertainer", "Feat: Musician" */
  source: string;
  /** the choice that opened this one (background -> its feat -> the feat's picks) */
  granted_by_id?: string;
  level: number;
  count: number;
  chosen: number;
  /** the choices that answer it (left out when none do) */
  choice_ids?: string[];
  /** the allowed values (skills, abilities, feat names) */
  from?: string[];
  /** any value of the kind */
  any?: boolean;
  /** an ability increase's most per ability */
  amount?: number;
  /** an ability increase gives amount x ability_count points */
  ability_count?: number;
  /** level: exactly (0 is a cantrip); a class's spells go from min_level up to max_level (the highest slot) */
  spell_filter?: {
    level?: number;
    min_level?: number;
    max_level?: number;
    classes?: string[];
    schools?: string[];
    ritual?: boolean;
  };
  /** the book's wording: "+2 to one and +1 to another, or +1 to all three"; a spell pick's filter: "Wizard cantrips" */
  text?: string;
  /** takes any number (spells copied into a spellbook): count is however many are chosen */
  open?: boolean;
  /** what each value in `from` gives (the starting equipment packages) */
  options?: { label: string; text: string }[];
}

export interface SheetIssue {
  /** info is an approved exception */
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
}

export interface Attack {
  name: string;
  kind: 'melee' | 'ranged';
  ability: AbilityCode;
  proficient: boolean;
  bonus: Stat;
  /** "1d8+3 Slashing" */
  damage: string;
  versatile?: string;
  range?: string;
  properties: string[];
  mastery?: string;
}

export interface SpellLimit {
  limit: number;
  chosen: number;
}

export interface Spellcasting {
  /** the casting class or subclass */
  source: string;
  ability: AbilityCode;
  save_dc: Stat;
  attack: Stat;
  /** picked at each level (choice points) */
  cantrips: SpellLimit | null;
  /** level 1+ spells: prepared from the class's list, or for a class that learns them, its picks */
  prepared: SpellLimit | null;
  /** long_rest: prepared from the class's list (prepared_spells); level_up: picked at each level (Bard) */
  change: 'long_rest' | 'level_up';
  /** the class keeps a spellbook (Wizard): the spellbook rule applies to it */
  has_spellbook?: boolean;
  /** the spellbook rule is on: prepare from the spellbook's picks */
  spellbook_rule?: boolean;
  /** slots for spell levels 1-9 */
  slots: number[];
  pact_slots?: number;
  pact_slot_level?: number;
}

/** A spell from a feat or species trait (class spells are the prepared spells) */
export interface GrantedSpell {
  /** a fixed spell's catalog slug */
  spell?: string;
  /** a picked spell's name */
  name?: string;
  source: string;
  uses?: string;
  ability?: AbilityCode;
  save_dc?: number;
  attack?: number;
  note?: string;
}

export interface Feature {
  name: string;
  level: number;
  source: string;
}

export interface Resistance {
  type: 'resistance' | 'immunity' | 'vulnerability';
  /** a damage type (fire) or a condition (charmed) */
  against: string;
  source: string;
}

/** Advantage or disadvantage that only applies sometimes (saves to end the Poisoned condition) */
export interface ConditionalRoll {
  mod: 'advantage' | 'disadvantage';
  on: string[];
  condition?: string;
  source: string;
  text?: string;
}

export interface CharacterSheet {
  level: number;
  proficiency_bonus: Stat;
  abilities: Record<AbilityCode, { score: Stat; modifier: number }>;
  saving_throws: Record<AbilityCode, SavingThrow>;
  skills: Record<SkillCode, Skill>;
  passive: Record<PassiveSkill, Stat>;
  initiative: Stat;
  armor_class: Stat;
  hit_points: { max: Stat; hit_dice: string };
  speed: Partial<Record<SpeedKind, Stat>>;
  /** the range in feet */
  senses: Partial<Record<SenseKind, Stat>>;
  /** as the catalog prints it: Medium, Small; empty with no species */
  size: string;
  features: Feature[];
  proficiencies: Partial<Record<ProficiencyKind, string[]>>;
  resistances: Resistance[];
  conditional: ConditionalRoll[];
  /** equipped weapons, then the unarmed strike */
  attacks: Attack[];
  spellcasting: Spellcasting | null;
  spells: GrantedSpell[];
  /** the class table's other columns at this level (Rages, Sneak Attack, ...); left out with no class */
  class_table?: Record<string, string | number>;
  choice_points: ChoicePoint[];
  issues: SheetIssue[];
  /** what the engine doesn't compute yet */
  not_computed: string[];
}

export const ABILITIES: { code: AbilityCode; name: string }[] = [
  { code: 'str', name: 'Strength' },
  { code: 'dex', name: 'Dexterity' },
  { code: 'con', name: 'Constitution' },
  { code: 'int', name: 'Intelligence' },
  { code: 'wis', name: 'Wisdom' },
  { code: 'cha', name: 'Charisma' },
];

/** The skills in the book's order (alphabetical), with their codes as the sheet keys them */
export const SKILLS: { code: SkillCode; name: string }[] = [
  { code: 'acrobatics', name: 'Acrobatics' },
  { code: 'animal_handling', name: 'Animal Handling' },
  { code: 'arcana', name: 'Arcana' },
  { code: 'athletics', name: 'Athletics' },
  { code: 'deception', name: 'Deception' },
  { code: 'history', name: 'History' },
  { code: 'insight', name: 'Insight' },
  { code: 'intimidation', name: 'Intimidation' },
  { code: 'investigation', name: 'Investigation' },
  { code: 'medicine', name: 'Medicine' },
  { code: 'nature', name: 'Nature' },
  { code: 'perception', name: 'Perception' },
  { code: 'performance', name: 'Performance' },
  { code: 'persuasion', name: 'Persuasion' },
  { code: 'religion', name: 'Religion' },
  { code: 'sleight_of_hand', name: 'Sleight of Hand' },
  { code: 'stealth', name: 'Stealth' },
  { code: 'survival', name: 'Survival' },
];

/** The numbers and rolls a boon or bane can change: the targets go_dnd applies */
export const MODIFIER_TARGETS: { target: string; label: string }[] = [
  { target: 'ac', label: 'Armor Class' },
  { target: 'initiative', label: 'Initiative' },
  { target: 'hp.max', label: 'Max HP' },
  { target: 'hp.per_level', label: 'HP per level' },
  { target: 'save.all', label: 'Every saving throw' },
  ...ABILITIES.map((a) => ({ target: `ability.${a.code}`, label: `${a.name} score` })),
  ...ABILITIES.map((a) => ({ target: `save.${a.code}`, label: `${a.name} save` })),
  ...SKILLS.map((s) => ({ target: `skill.${s.code}`, label: s.name })),
  { target: 'passive.perception', label: 'Passive Perception' },
  { target: 'passive.investigation', label: 'Passive Investigation' },
  { target: 'passive.insight', label: 'Passive Insight' },
  { target: 'speed.walk', label: 'Walking speed' },
  { target: 'speed.fly', label: 'Flying speed' },
  { target: 'speed.swim', label: 'Swimming speed' },
  { target: 'speed.climb', label: 'Climbing speed' },
  { target: 'sense.darkvision', label: 'Darkvision' },
  { target: 'spell.dc', label: 'Spell save DC' },
  { target: 'spell.attack', label: 'Spell attack' },
  { target: 'attack.melee', label: 'Melee attacks' },
  { target: 'attack.ranged', label: 'Ranged attacks' },
];
