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

/** Item categories in the data (the items filter's values) */
export const ITEM_CATEGORIES = [
  'adventuring-gear',
  'armor',
  'currency',
  'explosive',
  'gemstone',
  'modern-firearms-and-explosives',
  'mounts-and-vehicles',
  'poison',
  'potion',
  'ring',
  'rod',
  'scroll',
  'shield',
  'staff',
  'tool',
  'wand',
  'weapon',
  'wondrous-item',
] as const;

/** Magic item rarities, lowest first; varies and unknown are printed that way */
export const ITEM_RARITIES = [
  'common',
  'uncommon',
  'rare',
  'very rare',
  'legendary',
  'artifact',
  'unique',
  'varies',
  'unknown',
] as const;

export type ItemRarity = (typeof ITEM_RARITIES)[number];

/** An item as the API returns it (go_dnd `api/openapi/dnd.yaml`, `Item`) */
export interface ItemSchema {
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
  /** "weapon", "armor", "wondrous-item", ... */
  category: string | null;
  /** "Martial Melee Weapons", "Light Armor" */
  subcategory: string | null;
  /** as printed: "25 GP" */
  cost: string | null;
  /** as printed: "1 lb." */
  weight: string | null;
  /** the table's other columns: Damage, Properties, Mastery, Armor Class, ... */
  properties: Record<string, unknown>;
  /** typed modifiers (the ETL's effect atoms) */
  effects: Record<string, unknown>[];
  /** gear and magic items share the table */
  is_magic: boolean;
  /** "Weapon", "Wondrous Item", "Ring" */
  magic_item_type: string | null;
  /** "Any Melee Weapon", "any sword" */
  base_item: string | null;
  rarity: ItemRarity | null;
  /** as printed when it isn't one value */
  rarity_text: string | null;
  requires_attunement: boolean;
  /** "by a wizard" */
  attunement_requirement: string | null;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
}

/** The list store's entity id */
export const selectItemId: SelectEntityId<ItemSchema> = (item) => item.id;

export const selectItemIdKey: EntityId = 'id' as keyof ItemSchema;

/** The item page's URL: /dnd/items/:source/:slug (phb_2024/...) */
export const itemRoute = (item: Pick<ItemSchema, 'slug' | 'source'>): string[] => [
  '/',
  'dnd',
  'items',
  item.source.slug,
  item.slug,
];
