import { EntityId, SelectEntityId } from '@ngrx/signals/entities';

/** The source an entry is printed in, as entries carry it */
export interface SourceRef {
  id: string;
  /** phb_2024; the first part of the entry's URL */
  slug: string;
  name: string;
  /** PHB */
  name_short: string;
}

/** The ability a class casts with (5e.tools); null when it doesn't cast */
export const SPELLCASTING_ABILITIES = ['int', 'wis', 'cha'] as const;

export type SpellcastingAbility = (typeof SPELLCASTING_ABILITIES)[number];

/** How fast a class gains spell slots; half_up is the 2024 Paladin and Ranger (slots at level 1) */
export const CASTER_PROGRESSIONS = ['full', 'half', 'half_up', 'third', 'pact'] as const;

export type CasterProgression = (typeof CASTER_PROGRESSIONS)[number];

/** A class as the API returns it (go_dnd `api/openapi/dnd.yaml`, `Class`) */
export interface ClassSchema {
  id: string;
  source_id: string;
  source: SourceRef;
  /** unique within its source; the second part of the entry's URL */
  slug: string;
  name: string;
  /** "2024" */
  dnd_version: string;
  dnd_version_year: number;
  is_unearthed_arcana: boolean;
  is_homebrew: boolean;
  /** e.g. third_party */
  marks: string[];
  /** HTML */
  description: string;
  /** as printed: "1d10 per fighter level" */
  hit_die: string;
  /** the die's sides: 10 */
  hit_die_size: number | null;
  /** "Strength or Dexterity" */
  primary_ability: string;
  /** armor, weapons, tools, saving_throws, skills { choose, from } */
  proficiencies: Record<string, unknown>;
  /** as printed */
  starting_equipment: string;
  /** name, level, levels, description (+ json / markdown / html), effects */
  features: Record<string, unknown>[];
  /** its subclasses' slugs: artificer_alchemist */
  subclass_slugs: string[];
  spell_list: string | null;
  spellcasting_ability: SpellcastingAbility | null;
  caster_progression: CasterProgression | null;
  /** levels 1-20: level, cantrips, prepared, slots (spell levels 1-9), pact_slots, pact_slot_level, columns */
  level_table: Record<string, unknown>[];
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

/** The list store's entity id */
export const selectClassId: SelectEntityId<ClassSchema> = (dndClass) => dndClass.id;

export const selectClassIdKey: EntityId = 'id' as keyof ClassSchema;

/** The class page's URL: /dnd/classes/:source/:slug (phb_2024/...) */
export const classRoute = (dndClass: Pick<ClassSchema, 'slug' | 'source'>): string[] => [
  '/',
  'dnd',
  'classes',
  dndClass.source.slug,
  dndClass.slug,
];
