import { titleWords } from '@ttrpg-ui/shared/util';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';

type Rules = DndCharacterModels.Rules.Rules;
type OptionalRules = DndCharacterModels.Rules.OptionalRules;

export const ABILITY_METHODS: DndCharacterModels.Characters.AbilityMethod[] = [
  'point_buy',
  'standard_array',
  'rolled',
  'manual',
];

export const HP_METHODS: DndCharacterModels.Characters.HpMethod[] = ['average', 'rolled', 'manual'];

export const ENCUMBRANCE: OptionalRules['encumbrance'][] = ['off', 'standard', 'variant'];

/** When the other edition's entries are allowed, in words */
export const OTHER_EDITION_LABELS: Record<DndCharacterModels.Rules.OtherEditionMode, string> = {
  never: 'Never',
  if_missing: "Only where the base edition doesn't have it",
  always: 'Always',
};

/** The on/off optional rules, in words; encumbrance is a choice of three */
export const OPTIONAL_RULES: { key: Exclude<keyof OptionalRules, 'encumbrance'>; label: string }[] = [
  { key: 'feats', label: 'Feats' },
  { key: 'custom_origin', label: 'Custom origin (move ability increases)' },
  { key: 'optional_class_features', label: 'Optional class features' },
  { key: 'multiclass_prerequisites', label: 'Multiclass prerequisites' },
  { key: 'spellbook', label: 'Spellbook (Wizards learn spells into it and prepare from it)' },
];

/** The rule set in words, a line per part, for reading */
export const rulesSummary = (r: Rules): { label: string; text: string }[] => {
  const other = r.edition === 2024 ? 2014 : 2024;
  const methods = r.ability_score_methods.map((m) => {
    if (m === 'point_buy') return `Point Buy (${r.point_buy_budget} points)`;
    if (m === 'rolled') return `Rolled (last ${r.rolled_sets_kept} sets kept)`;
    return titleWords(m);
  });
  const optional = OPTIONAL_RULES.filter((o) => r.optional_rules[o.key]).map((o) => o.label);
  if (r.optional_rules.encumbrance !== 'off') optional.push(`${titleWords(r.optional_rules.encumbrance)} encumbrance`);
  const extras = [r.allow_unearthed_arcana && 'Unearthed Arcana', r.allow_playtest && 'playtest content'].filter(
    Boolean,
  );
  return [
    {
      label: 'Edition',
      text: `${r.edition}; ${other} content: ${OTHER_EDITION_LABELS[r.other_edition.default].toLowerCase()}`,
    },
    { label: 'Extra content', text: extras.length ? extras.join(' and ') : 'No Unearthed Arcana or playtest' },
    { label: 'Sources', text: r.sources.allow ? r.sources.allow.join(', ') : 'Every source' },
    {
      label: 'Ability scores',
      text: `${methods.join(', ')}; ${titleWords(r.ability_score_default)} by default`,
    },
    {
      label: 'Hit points',
      text: `${r.hp_methods.map(titleWords).join(', ')}; ${titleWords(r.hp_default)} by default`,
    },
    { label: 'Optional rules', text: optional.length ? optional.join(', ') : 'None' },
  ];
};
