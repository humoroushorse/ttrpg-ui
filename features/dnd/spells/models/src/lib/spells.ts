import { EntityId, SelectEntityId } from '@ngrx/signals/entities';
import { SharedModels } from '@ttrpg-ui/shared/models';

export interface GetListInput {
  limit?: number;
  offset?: number;
}

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

export interface SpellSchema extends SharedModels.Schemas.BookkeepingSchema {
  id: string;
  source_id: string;
  name: string;
  slug?: string;
  dnd_version: string;
  dnd_version_year: number;
  source_page?: number;
  level: number;
  school: SpellSchool;
  is_ritual: boolean;
  is_unearthed_arcana: boolean;
  casting_time: string;
  range: string;
  has_verbal_component: boolean;
  has_somatic_component: boolean;
  has_material_component: boolean;
  materials?: string;
  has_spell_cost: boolean;
  are_materials_consumed: boolean;
  duration: string;
  is_concentration: boolean;
  description: string;
  has_saving_throw: boolean;
  difficulty_class_saving_throw_override?: number;
  damage_type?: string;
  at_higher_levels?: string;
  difficulty_class_saving_throw: string;
  difficulty_class_type: string;
  stat_blocks: any[]; // TODO: typing???
}

export const selectSpellId: SelectEntityId<SpellSchema> = (gs) => gs.id;

export const selectSpellIdKey: EntityId = 'id' as keyof SpellSchema;

export interface SpellPostInput {
  name: string;
}
