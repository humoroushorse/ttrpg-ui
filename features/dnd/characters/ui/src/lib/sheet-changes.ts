import { titleWords } from '@ttrpg-ui/shared/util';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { signed } from './breakdown';

type Sheet = DndCharacterModels.Sheet.CharacterSheet;
type Stat = DndCharacterModels.Sheet.Stat;

/** One difference between two sheets, in words: "Charisma 15 -> 17", "New pick: Feat: Musician (tools)" */
export interface SheetChange {
  label: string;
  from?: string;
  to?: string;
  /** a list change: what was added or removed */
  note?: string;
}

/** A granted spell's name: a picked one has its name, a fixed one only its slug (dancing-lights) */
export const spellName = (spell: DndCharacterModels.Sheet.GrantedSpell): string =>
  spell.name ?? (spell.spell ? titleWords(spell.spell) : '?');

const statText = (stat: Stat | undefined, isBonus: boolean): string | undefined =>
  stat === undefined ? undefined : isBonus ? signed(stat.value) : `${stat.value}`;

/** A spell limit's number: "4" */
const limitText = (limit: DndCharacterModels.Sheet.SpellLimit | null | undefined): string =>
  limit ? `${limit.limit}` : '';

/** The slots by spell level: "1st 4, 2nd 2"; pact slots as "2 at 3rd" */
const slotsText = (sc: DndCharacterModels.Sheet.Spellcasting | null | undefined): string => {
  if (!sc) return '';
  const ordinal = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`;
  const slots = sc.slots.flatMap((n, i) => (n ? [`${ordinal(i + 1)} ${n}`] : []));
  if (sc.pact_slots) slots.push(`${sc.pact_slots} pact at ${ordinal(sc.pact_slot_level ?? 1)}`);
  return slots.join(', ');
};

/**
 * What changes between two sheets: numbers, features, proficiencies, and the picks the build asks
 * for. A preview's diff against the saved sheet shows what a pick does before it's saved.
 */
export const sheetChanges = (before: Sheet, after: Sheet): SheetChange[] => {
  const changes: SheetChange[] = [];
  const number = (label: string, a: Stat | undefined, b: Stat | undefined, isBonus = false) => {
    const from = statText(a, isBonus);
    const to = statText(b, isBonus);
    if (from !== to) changes.push({ label, from: from ?? '—', to: to ?? '—' });
  };
  const map = (label: (key: string) => string, a: Record<string, Stat>, b: Record<string, Stat>, isBonus = false) => {
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) number(label(key), a[key], b[key], isBonus);
  };

  const text = (label: string, a: string, b: string) => {
    if (a !== b) changes.push({ label, from: a || '—', to: b || '—' });
  };

  text('Level', `${before.level}`, `${after.level}`);
  text('Hit dice', before.hit_points.hit_dice, after.hit_points.hit_dice);
  for (const { code, name } of DndCharacterModels.Sheet.ABILITIES) {
    number(name, before.abilities[code]?.score, after.abilities[code]?.score);
  }
  number('Armor Class', before.armor_class, after.armor_class);
  number('Max HP', before.hit_points.max, after.hit_points.max);
  number('Initiative', before.initiative, after.initiative, true);
  number('Proficiency bonus', before.proficiency_bonus, after.proficiency_bonus, true);
  map((k) => `${titleWords(k)} speed`, before.speed, after.speed);
  map((k) => titleWords(k), before.senses, after.senses);
  map((k) => `${titleWords(k)} save`, before.saving_throws, after.saving_throws, true);
  const skillNames = Object.fromEntries(DndCharacterModels.Sheet.SKILLS.map((s) => [s.code, s.name]));
  map((k) => skillNames[k] ?? titleWords(k), before.skills, after.skills, true);
  map((k) => `Passive ${titleWords(k)}`, before.passive, after.passive);
  if (before.size !== after.size) changes.push({ label: 'Size', from: before.size || '—', to: after.size || '—' });
  number('Spell save DC', before.spellcasting?.save_dc, after.spellcasting?.save_dc);
  number('Spell attack', before.spellcasting?.attack, after.spellcasting?.attack, true);
  text('Cantrips', limitText(before.spellcasting?.cantrips), limitText(after.spellcasting?.cantrips));
  text('Prepared spells', limitText(before.spellcasting?.prepared), limitText(after.spellcasting?.prepared));
  text('Spell slots', slotsText(before.spellcasting), slotsText(after.spellcasting));
  for (const key of new Set([...Object.keys(before.class_table ?? {}), ...Object.keys(after.class_table ?? {})])) {
    text(key, `${before.class_table?.[key] ?? ''}`, `${after.class_table?.[key] ?? ''}`);
  }

  const list = (label: string, a: string[], b: string[]) => {
    const added = b.filter((x) => !a.includes(x));
    const removed = a.filter((x) => !b.includes(x));
    if (added.length) changes.push({ label, note: `+ ${added.join(', ')}` });
    if (removed.length) changes.push({ label, note: `− ${removed.join(', ')}` });
  };
  const featureNames = (s: Sheet) => s.features.map((f) => `${f.name} (${f.source})`);
  list('Features', featureNames(before), featureNames(after));
  for (const kind of DndCharacterModels.Sheet.PROFICIENCY_KINDS) {
    list(`${titleWords(kind)} proficiencies`, before.proficiencies[kind] ?? [], after.proficiencies[kind] ?? []);
  }
  const spellNames = (s: Sheet) => s.spells.map(spellName);
  list('Spells from feats and traits', spellNames(before), spellNames(after));
  const pointNames = (s: Sheet) =>
    s.choice_points.map((p) => `${p.source}: ${p.kinds.join(' or ')}${p.count > 1 ? ` ×${p.count}` : ''}`);
  list('Picks asked for', pointNames(before), pointNames(after));
  const issueNames = (s: Sheet) => s.issues.map((i) => i.message);
  list('Issues', issueNames(before), issueNames(after));
  return changes;
};
