import { map } from 'rxjs';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { BuildWrite, DndCharacterApiService } from '@ttrpg-ui/features/dnd/characters/data-access';
import { SharedFormsSearchFn } from '@ttrpg-ui/shared/forms/ui';

type Option = DndCharacterModels.Build.CharacterOption;
type ChoiceBody = DndCharacterModels.Build.ChoiceBody;
type ChoiceKind = DndCharacterModels.Characters.ChoiceKind;
type ChoicePoint = DndCharacterModels.Sheet.ChoicePoint;
type Choice = DndCharacterModels.Characters.CharacterChoice;
type Operation = DndCharacterModels.Build.SheetOperation;

/** What a pick is: a catalog row's id, or a value ({ skill: 'arcana' }, { increases: { int: 2 } }) */
export type Pick = { refId: string } | { value: Record<string, unknown> };

/** The choice that answers `point` with `pick`, as kind `kind` (a point can take more than one kind) */
export const choiceBody = (point: ChoicePoint, kind: ChoiceKind, pick: Pick): ChoiceBody => {
  const body: ChoiceBody = { level: point.level, kind, slot: point.slot, granted_by_id: point.granted_by_id ?? null };
  const refField = DndCharacterModels.Build.REF_FIELD[kind];
  if ('refId' in pick && refField) return { ...body, [refField]: pick.refId };
  if ('value' in pick) return { ...body, value: pick.value };
  throw new Error(`a ${kind} pick needs ${refField ? 'a catalog id' : 'a value'}`);
};

/** A new choice, or a replacement for `existing` */
export const choiceOperation = (body: ChoiceBody, existing?: Choice): Operation =>
  existing ? { op: 'choice.replace', choice_id: existing.id, body } : { op: 'choice.add', body };

export const choiceWrite =
  (body: ChoiceBody, existing?: Choice): BuildWrite =>
  (api, id, version) =>
    existing ? api.replaceChoice(id, existing.id, body, version) : api.addChoice(id, body, version);

export const removeChoiceWrite =
  (choice: Choice): BuildWrite =>
  (api, id, version) =>
    api.deleteChoice(id, choice.id, version);

/** The class at level 1 for a character with no levels; otherwise a new class on every planned level */
export const classOperation = (classId: string, hasLevels: boolean): Operation =>
  hasLevels
    ? { op: 'character.update', body: { class_id: classId } }
    : { op: 'level.set', level: 1, body: { class_id: classId, hp_method: 'average' } };

export const classWrite =
  (classId: string, hasLevels: boolean): BuildWrite =>
  (api, id, version) =>
    hasLevels
      ? api.patch(id, { class_id: classId }, version)
      : api.setLevel(id, 1, { class_id: classId, hp_method: 'average' }, version);

/** The origin point (origin:species, origin:background) as the sheet lists it; a stand-in before there is a sheet */
export const originPoint = (kind: 'species' | 'background'): ChoicePoint => ({
  slot: `origin:${kind}`,
  kinds: [kind],
  source: 'Origin',
  level: 1,
  count: 1,
  chosen: 0,
});

/** Options a search box loads at a time */
const OPTIONS_PAGE = 25;

/** A search box's search: the options whose name contains the text, a page at a time */
export const searchOptions =
  (
    api: DndCharacterApiService,
    id: string,
    kind: DndCharacterModels.Build.OptionKind,
    query: DndCharacterModels.Build.OptionsQuery = {},
  ): SharedFormsSearchFn<Option> =>
  (name, offset) =>
    api
      .getOptions(id, kind, { ...query, name: name.trim() || undefined, offset, limit: OPTIONS_PAGE })
      .pipe(map((page) => ({ items: page.entities, total: page.total_entities_count })));
