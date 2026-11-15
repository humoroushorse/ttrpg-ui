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

/** The creature types, as the API writes them (the species filter's values) */
export const CREATURE_TYPES = [
  'Aberration',
  'Beast',
  'Celestial',
  'Construct',
  'Dragon',
  'Elemental',
  'Fey',
  'Fiend',
  'Giant',
  'Humanoid',
  'Monstrosity',
  'Ooze',
  'Plant',
  'Undead',
] as const;

/** A species as the API returns it (go_dnd `api/openapi/dnd.yaml`, `Species`) */
export interface SpeciesSchema {
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
  /** "Medium", "Small", "Medium or Small" */
  size: string;
  /** walking speed: "30 feet" */
  speed: string;
  /** "Humanoid", "Fey", ... */
  creature_type: string;
  /** name, description (+ markdown / html), level, choices, effects */
  traits: Record<string, unknown>[];
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

/** The list store's entity id */
export const selectSpeciesId: SelectEntityId<SpeciesSchema> = (species) => species.id;

export const selectSpeciesIdKey: EntityId = 'id' as keyof SpeciesSchema;

/** The species page's URL: /dnd/species/:source/:slug (phb_2024/...) */
export const speciesRoute = (species: Pick<SpeciesSchema, 'slug' | 'source'>): string[] => [
  '/',
  'dnd',
  'species',
  species.source.slug,
  species.slug,
];
