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

/** The feat categories in the data (the feats filter's values) */
export const FEAT_CATEGORIES = [
  'Origin',
  'General',
  'Fighting Style',
  'Epic Boon',
  'Dragonmark',
  'Dark Gift',
  'Planar Pact',
] as const;

/** What a feat needs, as printed (`text`) and as far as the ETL could read it */
export interface FeatPrerequisites {
  /** "Level 4+, Charisma 13+" */
  text: string;
  min_level: number | null;
  /** { ability: cha, score: 13, choice } */
  ability_minimums: Record<string, unknown>[];
  /** { name, slug } */
  feats: Record<string, unknown>[];
  features: Record<string, unknown>[];
  species: Record<string, unknown>[];
  proficiencies: Record<string, unknown>[];
}

/** A feat as the API returns it (go_dnd `api/openapi/dnd.yaml`, `Feat`) */
export interface FeatSchema {
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
  /** "Origin", "General", "Epic Boon"; often missing */
  category: string | null;
  prerequisites: FeatPrerequisites | null;
  /** typed modifiers (the ETL's effect atoms) */
  effects: Record<string, unknown>[];
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

/** The list store's entity id */
export const selectFeatId: SelectEntityId<FeatSchema> = (feat) => feat.id;

export const selectFeatIdKey: EntityId = 'id' as keyof FeatSchema;

/** The feat page's URL: /dnd/feats/:source/:slug (phb_2024/...) */
export const featRoute = (feat: Pick<FeatSchema, 'slug' | 'source'>): string[] => [
  '/',
  'dnd',
  'feats',
  feat.source.slug,
  feat.slug,
];
