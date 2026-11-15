import { titleWords } from '@ttrpg-ui/shared/util';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';

type Stat = DndCharacterModels.Sheet.Stat;
type Contribution = DndCharacterModels.Sheet.Contribution;
type Choice = DndCharacterModels.Characters.CharacterChoice;

/** +3, -1, +0 */
export const signed = (value: number): string => (value < 0 ? `${value}` : `+${value}`);

/** "Background: Soldier +2", "Gauntlets of Ogre Power: becomes 19 (at least 19)" */
const contributionLine = (c: Contribution, isBonus: boolean): string => {
  const amount =
    {
      base: isBonus ? signed(c.value) : `${c.value}`,
      add: signed(c.value),
      set: `becomes ${c.value}`,
      min: `at least ${c.value}`,
      max: `at most ${c.value}`,
    }[c.op] ?? `${c.op} ${c.value}`;
  return `${c.source}: ${amount}${c.note ? ` (${c.note})` : ''}`;
};

/**
 * A number's breakdown as tooltip lines: the total, what makes it up, what doesn't apply right
 * now, and what gives advantage or disadvantage. `isBonus` writes the base as +3 (skills, saves).
 */
export const breakdownText = (label: string, stat: Stat, isBonus = false): string => {
  const lines = [`${label}: ${isBonus ? signed(stat.value) : stat.value}`];
  lines.push(...stat.contributions.map((c) => contributionLine(c, isBonus)));
  if (stat.inactive?.length) {
    lines.push('Not applied:', ...stat.inactive.map((c) => `  ${contributionLine(c, isBonus)}`));
  }
  if (stat.advantage?.length) lines.push(`Advantage: ${stat.advantage.join(', ')}`);
  if (stat.disadvantage?.length) lines.push(`Disadvantage: ${stat.disadvantage.join(', ')}`);
  if (stat.roll && stat.roll !== 'normal' && !stat.advantage?.length && !stat.disadvantage?.length) {
    lines.push(titleWords(stat.roll));
  }
  return lines.join('\n');
};

const ABILITY_NAMES = Object.fromEntries(DndCharacterModels.Sheet.ABILITIES.map((a) => [a.code, a.name.slice(0, 3)]));

const SKILL_NAMES = Object.fromEntries(DndCharacterModels.Sheet.SKILLS.map((s) => [s.code, s.name]));

/** A code as the book writes it: sleight_of_hand -> Sleight of Hand, half_up -> Half Up */
export const codeLabel = (code: string): string => SKILL_NAMES[code] ?? titleWords(code);

/** What a choice picked, in words: "Human", "Arcana", "+2 Cha, +1 Dex", "Int", "High Elf" */
export const choiceLabel = (choice: Choice): string => {
  if (choice.ref_name) return choice.ref_name;
  const value = choice.value ?? {};
  const increases = value['increases'] as Record<string, number> | undefined;
  if (increases) {
    return Object.entries(increases)
      .map(([ability, n]) => `${signed(n)} ${ABILITY_NAMES[ability] ?? ability}`)
      .join(', ');
  }
  const ability = value['ability'] as string | undefined;
  if (ability) return ABILITY_NAMES[ability] ?? ability;
  const picked = Object.values(value).find((v) => typeof v === 'string') as string | undefined;
  return picked ? codeLabel(picked) : choice.kind;
};
