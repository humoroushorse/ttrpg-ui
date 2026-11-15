import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TitleWordsPipe } from '@ttrpg-ui/shared/util';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { ABILITY_METHODS, ENCUMBRANCE, HP_METHODS, OPTIONAL_RULES, OTHER_EDITION_LABELS } from './rules-text';

type Rules = DndCharacterModels.Rules.Rules;
type OptionalRules = DndCharacterModels.Rules.OptionalRules;

/** The methods list with one added or taken out; the default moves to a remaining one */
const toggled = <T>(list: T[], value: T, on: boolean): T[] =>
  on ? [...new Set([...list, value])] : list.filter((v) => v !== value);

/**
 * A campaign's rule set: editions, Unearthed Arcana and playtest, ability score and HP methods, and
 * the optional rules. Controlled: it shows `rules` and emits each change as a whole new rule set.
 * Sources and per-category edition overrides aren't here yet; a save keeps them as they are.
 */
@Component({
  selector: 'lib-dnd-campaign-rules-form',
  imports: [
    TitleWordsPipe,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  templateUrl: './rules-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DndCampaignRulesFormComponent {
  readonly rules = input.required<Rules>();

  readonly rulesChange = output<Rules>();

  protected readonly abilityMethods = ABILITY_METHODS;

  protected readonly hpMethods = HP_METHODS;

  protected readonly otherEdition = Object.entries(OTHER_EDITION_LABELS);

  protected readonly optionalRules = OPTIONAL_RULES;

  protected readonly encumbrance = ENCUMBRANCE;

  set<K extends keyof Rules>(key: K, value: Rules[K]): void {
    this.rulesChange.emit({ ...this.rules(), [key]: value });
  }

  setOptional<K extends keyof OptionalRules>(key: K, value: OptionalRules[K]): void {
    this.set('optional_rules', { ...this.rules().optional_rules, [key]: value });
  }

  onOtherEdition(mode: DndCharacterModels.Rules.OtherEditionMode): void {
    this.set('other_edition', { ...this.rules().other_edition, default: mode });
  }

  onAbilityMethod(method: DndCharacterModels.Characters.AbilityMethod, on: boolean): void {
    const r = this.rules();
    const methods = toggled(r.ability_score_methods, method, on);
    const fallback = methods.includes(r.ability_score_default) ? r.ability_score_default : methods[0];
    this.rulesChange.emit({ ...r, ability_score_methods: methods, ability_score_default: fallback });
  }

  onHpMethod(method: DndCharacterModels.Characters.HpMethod, on: boolean): void {
    const r = this.rules();
    const methods = toggled(r.hp_methods, method, on);
    this.rulesChange.emit({
      ...r,
      hp_methods: methods,
      hp_default: methods.includes(r.hp_default) ? r.hp_default : methods[0],
    });
  }

  /** A whole number in range, or the current value */
  onNumber(key: 'point_buy_budget' | 'rolled_sets_kept', value: number, max: number): void {
    if (Number.isInteger(value) && value >= (key === 'point_buy_budget' ? 0 : 1) && value <= max) this.set(key, value);
  }
}
