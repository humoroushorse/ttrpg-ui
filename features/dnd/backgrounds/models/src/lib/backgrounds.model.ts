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

/** A background as the API returns it (go_dnd `api/openapi/dnd.yaml`, `Background`) */
export interface BackgroundSchema {
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
  /** 2024, as printed: "Strength, Constitution, Charisma"; empty for 2014 */
  ability_score_bonuses: string;
  skill_proficiencies: string[];
  tool_proficiencies: string[];
  /** 2024, as printed: "Magic Initiate (Cleric)"; empty for 2014 */
  feat: string;
  /** the wiki's Equipment line */
  equipment_text: string;
  /** [{ label, items, coins }] (A / B in 2024) */
  equipment_options: Record<string, unknown>[];
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

/** The list store's entity id */
export const selectBackgroundId: SelectEntityId<BackgroundSchema> = (background) => background.id;

export const selectBackgroundIdKey: EntityId = 'id' as keyof BackgroundSchema;

/** The background page's URL: /dnd/backgrounds/:source/:slug (phb_2024/...) */
export const backgroundRoute = (background: Pick<BackgroundSchema, 'slug' | 'source'>): string[] => [
  '/',
  'dnd',
  'backgrounds',
  background.source.slug,
  background.slug,
];
