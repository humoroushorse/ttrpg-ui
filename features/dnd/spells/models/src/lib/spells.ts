import { EntityId, SelectEntityId } from '@ngrx/signals/entities';

export enum SpellSchool {
  ABJURATION = 'abjuration',
  ALTERATION = 'alteration',
  CONJURATION = 'conjuration',
  DIVINATION = 'divination',
  ENCHANTMENT = 'enchantment',
  EVOCATION = 'evocation',
  TRANSMUTATION = 'transmutation',
  ILLUSION = 'illusion',
  INVOCATION = 'invocation',
  NECROMANCY = 'necromancy',
}

/** 0 is a cantrip */
export type SpellLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * What the VTT needs to resolve the spell (ttrpg-api/schemas/vtt_spell.v1.schema.json).
 * Loose for now; typed when the cast preview needs it.
 */
export interface VttSpell {
  schema_version?: number;
  range: Record<string, unknown>;
  duration: Record<string, unknown>;
  sustain?: string | null;
  modes: Record<string, unknown>[];
  [key: string]: unknown;
}

/** Every field a client writes (POST and PUT bodies). Optional fields have server defaults. */
export interface SpellWrite {
  source_id: string;
  /** unique within its source */
  slug: string;
  name: string;
  dnd_version: string;
  dnd_version_year: number;
  source_page?: number | null;
  level: SpellLevel;
  school: SpellSchool;
  is_ritual?: boolean;
  casting_time: string;
  range: string;
  has_verbal_component?: boolean;
  has_somatic_component?: boolean;
  has_material_component?: boolean;
  materials?: string | null;
  has_spell_cost?: boolean;
  are_materials_consumed?: boolean;
  duration: string;
  is_concentration?: boolean;
  /** HTML */
  description: string;
  has_saving_throw?: boolean;
  difficulty_class_saving_throw_override?: number | null;
  damage_type?: string | null;
  /** HTML */
  at_higher_levels?: string | null;
  difficulty_class_saving_throw?: string | null;
  difficulty_class_type?: string | null;
  stat_blocks?: Record<string, unknown>[] | null;
  is_unearthed_arcana?: boolean;
  is_homebrew?: boolean;
  vtt: VttSpell;
}

/** PATCH body: only the fields to change. `null` clears an optional field; `vtt` is replaced whole. */
export type SpellPatch = Partial<SpellWrite>;

/** Columns the database generates from `vtt` (read only) */
export interface SpellVttColumns {
  activation_cost: string | null;
  activation_amount: number | null;
  range_kind: string | null;
  range_feet: number | null;
  duration_kind: string | null;
  duration_amount: number | null;
  duration_unit: string | null;
  /** concentration */
  sustain: string | null;
  has_attack_roll: boolean | null;
  has_save: boolean | null;
  has_summon: boolean | null;
}

/** dnd.user ids; null once that user is purged */
export interface SpellBookkeeping {
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

/** The book a spell is printed in (read only) */
export interface SpellSource {
  id: string;
  /** unique across editions (phb_2024) */
  slug: string;
  name: string;
  name_short: string;
}

/** A spell as the API returns it */
export interface SpellSchema extends Required<SpellWrite>, SpellVttColumns, SpellBookkeeping {
  id: string;
  source: SpellSource;
}

/** The spell page's URL: /dnd/spells/:source/:slug (phb_2024/acid-splash) */
export const spellRoute = (spell: Pick<SpellSchema, 'slug' | 'source'>): string[] => [
  '/',
  'dnd',
  'spells',
  spell.source.slug,
  spell.slug,
];

export const selectSpellId: SelectEntityId<SpellSchema> = (spell) => spell.id;

export const selectSpellIdKey: EntityId = 'id' as keyof SpellSchema;
