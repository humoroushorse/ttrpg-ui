import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { DndCharacterApiService, DndCharacterBuildStore } from '@ttrpg-ui/features/dnd/characters/data-access';
import { choiceLabel, CodeLabelPipe, codeLabel } from '@ttrpg-ui/features/dnd/characters/ui';
import {
  SharedFormsSingleSelectAutocompleteComponent,
  SharedFormsSingleSelectComponent,
} from '@ttrpg-ui/shared/forms/ui';
import { choiceBody, choiceOperation, choiceWrite, Pick, removeChoiceWrite, searchOptions } from './build-ops';

type ChoicePoint = DndCharacterModels.Sheet.ChoicePoint;
type Choice = DndCharacterModels.Characters.CharacterChoice;
type Option = DndCharacterModels.Build.CharacterOption;

const { VALUE_KEY, REF_FIELD, DAMAGE_TYPES, ALL_ABILITIES } = DndCharacterModels.Build;
const SKILL_CODES = DndCharacterModels.Sheet.SKILLS.map((s) => s.code);

/** The ways to split an increase of `total` points, at most `amount` per ability: 3 by 2 -> [2,1], [1,1,1] */
const splits = (total: number, amount: number): number[][] => {
  const out: number[][] = [];
  const walk = (left: number, max: number, parts: number[]) => {
    if (left === 0) return void out.push(parts);
    for (let n = Math.min(max, left); n >= 1; n--) walk(left - n, n, [...parts, n]);
  };
  walk(total, amount, []);
  return out;
};

/**
 * One pick the build asks for: what answers it now, and a control to add, change or remove a pick
 * of the point's kind. Choosing previews the sheet; Add (or Change) saves. Every check stays the
 * API's: the sheet reports an invalid pick as an issue.
 */
@Component({
  selector: 'lib-dnd-build-choice-point',
  imports: [
    CodeLabelPipe,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    SharedFormsSingleSelectAutocompleteComponent,
    SharedFormsSingleSelectComponent,
  ],
  templateUrl: './build-choice-point.component.html',
  styleUrl: './build-choice-point.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DndBuildChoicePointComponent {
  protected readonly build = inject(DndCharacterBuildStore);

  private readonly api = inject(DndCharacterApiService);

  readonly point = input.required<ChoicePoint>();

  /** The choices that answer it */
  protected readonly picks = computed(() =>
    (this.point().choice_ids ?? []).map((id) => this.build.choicesById().get(id)).filter((c): c is Choice => !!c),
  );

  protected readonly full = computed(() => this.point().chosen >= this.point().count);

  /** A one-pick point that's answered gets a "change" control; the others add until full */
  protected readonly replacing = computed<Choice | undefined>(() =>
    this.point().count === 1 && !this.point().open ? this.picks()[0] : undefined,
  );

  /**
   * Picks that replace or remove something preview first and wait for Save: a change, a subclass,
   * the starting equipment package (it moves items and coins). The rest save as they're picked.
   */
  protected readonly confirms = computed(
    () => !!this.replacing() || this.kind() === 'subclass' || /:equipment$/.test(this.point().slot),
  );

  /** A pick saved straight from its control; the control clears once the save is done */
  private readonly savingPick = signal(false);

  /** An open point (spells copied into a spellbook) always takes one more */
  protected readonly canPick = computed(() => !this.full() || !!this.replacing() || !!this.point().open);

  /** Which of the point's kinds to answer with (a class ASI takes an increase or a feat) */
  protected readonly kind = linkedSignal(() => this.picks()[0]?.kind ?? this.point().kinds[0]);

  protected readonly isCatalog = computed(() => !!REF_FIELD[this.kind()]);

  protected readonly isAsi = computed(() => this.kind() === 'asi');

  /**
   * What the options depend on, compared by value: a save elsewhere hands the point a new object with
   * the same values, and shouldn't refetch. This point's own picks do (their "chosen" marks change).
   */
  private readonly optionsParams = computed(
    () => {
      const id = this.build.character()?.id;
      const kind = this.kind();
      if (!id || !REF_FIELD[kind] || !this.canPick()) return undefined;
      return {
        id,
        kind: kind as DndCharacterModels.Build.OptionKind,
        slot: this.point().slot,
        // an open point's filter (the highest slot) is the build level's, not its own level 1's
        level: this.point().open ? this.build.buildLevel() : this.point().level,
        picks: (this.point().choice_ids ?? []).join(','),
      };
    },
    { equal: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
  );

  /** Searches the catalog entries for the point (feats, spells, a subclass), with the point's own filter */
  protected readonly search = computed(() => {
    const params = this.optionsParams();
    return params ? searchOptions(this.api, params.id, params.kind, { slot: params.slot, level: params.level }) : null;
  });

  /** Taken entries show but can't be picked again (except to change a one-pick point) */
  protected readonly catalogDisabled = (o: Option): boolean => !o.allowed || (o.chosen && !this.replacing());

  /** The catalog entry picked but not saved */
  protected readonly catalogValue = signal<Option | null>(null);

  /** A value in words; a package says what it gives ("A: Leather Armor, ... 19 GP") */
  protected readonly valueLabel = (value: string): string => {
    const option = this.point().options?.find((o) => o.label === value);
    return option ? `${option.label}: ${option.text}` : codeLabel(value);
  };

  constructor() {
    effect(() => {
      if (this.savingPick() && !this.build.saving()) {
        untracked(() => {
          this.savingPick.set(false);
          this.reset();
        });
      }
    });
  }

  /** The values a value pick can take; null means free text (any tool, any language) */
  protected readonly valueOptions = computed((): string[] | null => {
    const p = this.point();
    const kind = this.kind();
    const taken = new Set(this.picks().map((c) => this.valueOf(c)));
    const fresh = (values: string[]) => values.filter((v) => !taken.has(v) || this.replacing());
    if (p.from?.length && !p.any) return fresh(p.from);
    if (kind === 'skill') return fresh(SKILL_CODES);
    if (kind === 'expertise') {
      // Expertise needs proficiency: the skills the sheet says are proficient, without expertise yet
      const skills = this.build.sheet()?.skills;
      return fresh(SKILL_CODES.filter((s) => skills?.[s].proficient && !skills[s].expertise));
    }
    if (kind === 'saving_throw' || kind === 'spellcasting_ability') return fresh(ALL_ABILITIES);
    if (kind === 'resistance') return fresh(DAMAGE_TYPES);
    return null;
  });

  /**
   * Whether the sheet already has this proficiency from somewhere else, so picking it adds nothing
   * (the sheet doesn't warn about that yet)
   */
  protected alreadyHas(value: string): boolean {
    const sheet = this.build.sheet();
    if (!sheet) return false;
    switch (this.kind()) {
      case 'skill':
        return !!sheet.skills[value as DndCharacterModels.Sheet.SkillCode]?.proficient;
      case 'saving_throw':
        return !!sheet.saving_throws[value as DndCharacterModels.Characters.AbilityCode]?.proficient;
      case 'tool':
        return (sheet.proficiencies.tools ?? []).some((t) => t.toLowerCase() === value.toLowerCase());
      default:
        return false;
    }
  }

  // --- an ability increase: how to split it, then which ability gets each part ---

  /** Backgrounds give +2/+1 or +1/+1/+1 (3 points); the rest give amount x ability_count */
  private readonly asiTotal = computed(() => {
    const p = this.point();
    return /^background:.*:asi$/.test(p.slot) ? 3 : (p.amount ?? 1) * (p.ability_count ?? 1);
  });

  protected readonly asiSplits = computed(() => splits(this.asiTotal(), this.point().amount ?? 1));

  protected readonly asiSplit = linkedSignal(() => this.asiSplits()[0] ?? []);

  protected readonly asiAbilities = computed(() =>
    this.point().from?.length && !this.point().any ? this.point().from! : ALL_ABILITIES,
  );

  /** Which ability gets each part of the split, by position */
  protected readonly asiPicks = linkedSignal<number[], (string | null)[]>({
    source: this.asiSplit,
    computation: (split) => split.map(() => null),
  });

  /** The pick waiting to be saved */
  protected readonly pending = signal<{ pick: Pick; label: string } | null>(null);

  /** What the select shows; back to empty after a save or cancel */
  protected readonly selectValue = signal<string | null>(null);

  protected readonly freeText = signal('');

  /** The abilities part `index` can take: not one another part already has */
  protected asiChoices(index: number): string[] {
    const others = this.asiPicks().filter((a, i) => i !== index && a);
    return this.asiAbilities().filter((a) => !others.includes(a));
  }

  protected splitLabel(split: number[]): string {
    return split.map((n) => `+${n}`).join(' / ');
  }

  onKind(kind: DndCharacterModels.Characters.ChoiceKind): void {
    this.kind.set(kind);
    this.cancel();
  }

  onCatalogPicked(option: Option | null): void {
    if (!option) {
      this.cancel();
      return;
    }
    this.catalogValue.set(option);
    this.propose({ refId: option.id }, option.name);
  }

  onValuePicked(value: string): void {
    this.selectValue.set(value);
    this.propose(this.valuePick(value), codeLabel(value));
  }

  /** Typed picks (any tool, any language) save on Add or Enter, without a preview */
  onTextAdd(): void {
    const text = this.freeText().trim();
    if (!text || this.build.saving()) return;
    this.saveNow(choiceBody(this.point(), this.kind(), this.valuePick(text)), text);
  }

  private valuePick(value: string): Pick {
    return { value: { [VALUE_KEY[this.kind()] ?? this.kind()]: value } };
  }

  onAsiSplit(split: number[]): void {
    this.asiSplit.set(split);
    this.pending.set(null);
    this.build.clearPreview();
  }

  onAsiAbility(index: number, ability: string): void {
    const picks = this.asiPicks().map((a, i) => (i === index ? ability : a === ability ? null : a));
    this.asiPicks.set(picks);
    if (picks.every((a) => a)) {
      const increases = Object.fromEntries(picks.map((a, i) => [a, this.asiSplit()[i]]));
      this.propose(
        { value: { increases } },
        Object.entries(increases)
          .map(([a, n]) => `+${n} ${codeLabel(a)}`)
          .join(', '),
      );
    }
  }

  onSave(): void {
    const pending = this.pending();
    if (!pending) return;
    this.saveNow(choiceBody(this.point(), this.kind(), pending.pick), pending.label);
  }

  onRemove(choice: Choice): void {
    this.build.write({ run: removeChoiceWrite(choice) });
  }

  cancel(): void {
    this.reset();
    this.build.clearPreview();
  }

  private reset(): void {
    this.pending.set(null);
    this.selectValue.set(null);
    this.catalogValue.set(null);
    this.freeText.set('');
    this.asiPicks.set(this.asiSplit().map(() => null));
  }

  protected pickLabel(choice: Choice): string {
    return choiceLabel(choice);
  }

  private saveNow(body: DndCharacterModels.Build.ChoiceBody, label: string): void {
    this.pending.set(null);
    this.build.write({ run: choiceWrite(body, this.replacing()), label: `${this.point().source}: ${label}` });
    this.savingPick.set(true);
  }

  private propose(pick: Pick, label: string): void {
    const body = choiceBody(this.point(), this.kind(), pick);
    if (!this.confirms()) {
      this.saveNow(body, label);
      return;
    }
    this.pending.set({ pick, label });
    this.build.previewChanges({
      label: `${this.point().source}: ${label}`,
      operations: [choiceOperation(body, this.replacing())],
    });
  }

  private valueOf(choice: Choice): string {
    return String((choice.value ?? {})[VALUE_KEY[choice.kind] ?? choice.kind] ?? '');
  }
}
