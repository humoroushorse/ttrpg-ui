import { EntityId, SelectEntityId } from '@ngrx/signals/entities';
import { DndClassModels } from '@ttrpg-ui/features/dnd/classes/models';

/** The source an entry is printed in, as entries carry it */
export interface SourceRef {
  id: string;
  /** phb_2024; the first part of the entry's URL */
  slug: string;
  name: string;
  /** PHB */
  name_short: string;
}

/** A subclass as the API returns it (go_dnd `api/openapi/dnd.yaml`, `Subclass`) */
export interface SubclassSchema {
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
  /** the class's slug (wizard); same edition as the subclass */
  parent_class_slug: string;
  /** the class level it's chosen at */
  level_gained: number;
  /** same shape as a class's features */
  features: Record<string, unknown>[];
  /** spell names (not linked yet) */
  spell_list_additions: string[];
  /** set for subclasses that cast on their own (Eldritch Knight, Arcane Trickster) */
  spellcasting_ability: DndClassModels.Classes.SpellcastingAbility | null;
  caster_progression: DndClassModels.Classes.CasterProgression | null;
  /** same shape as a class's level_table; empty unless the subclass casts */
  level_table: Record<string, unknown>[];
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

/** The list store's entity id */
export const selectSubclassId: SelectEntityId<SubclassSchema> = (subclass) => subclass.id;

export const selectSubclassIdKey: EntityId = 'id' as keyof SubclassSchema;

/** The subclass page's URL: /dnd/subclasses/:source/:slug (phb_2024/...) */
export const subclassRoute = (subclass: Pick<SubclassSchema, 'slug' | 'source'>): string[] => [
  '/',
  'dnd',
  'subclasses',
  subclass.source.slug,
  subclass.slug,
];
