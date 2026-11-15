import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TitleWordsPipe } from '@ttrpg-ui/shared/util';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { DndCharacterBuildStore } from '@ttrpg-ui/features/dnd/characters/data-access';
import { DndSheetStatComponent } from '@ttrpg-ui/features/dnd/characters/ui';

type AbilityCode = DndCharacterModels.Characters.AbilityCode;
type AbilityRoll = DndCharacterModels.Characters.AbilityRoll;
type Scores = DndCharacterModels.Characters.AbilityScores;
type Method = DndCharacterModels.Build.ScoreMethod;

/** Which value of the pool each ability has: its index (two 12s are different values), or none yet */
type Placement = Record<AbilityCode, number | null>;

const { ABILITIES } = DndCharacterModels.Sheet;
const { POINT_BUY_COST, STANDARD_ARRAY } = DndCharacterModels.Build;

/** The values a method allows for one score: point buy 8-15, manual 3-18; a pool for the others */
const RANGE: Partial<Record<Method, [number, number]>> = { point_buy: [8, 15], manual: [3, 18] };

const fullScores = (s: Partial<Scores> | undefined, fill: number): Scores =>
  Object.fromEntries(ABILITIES.map((a) => [a.code, s?.[a.code] ?? fill])) as Scores;

const emptyPlacement = (): Placement => Object.fromEntries(ABILITIES.map((a) => [a.code, null])) as Placement;

/** Where the saved scores sit in the pool, when they use its values each once; otherwise nothing placed */
const placementOf = (saved: Scores, pool: number[]): Placement => {
  const left = pool.map((value, index) => ({ value, index }));
  const out = emptyPlacement();
  for (const a of ABILITIES) {
    const k = left.findIndex((x) => x.value === saved[a.code]);
    if (k < 0) return emptyPlacement();
    out[a.code] = left[k].index;
    left.splice(k, 1);
  }
  return out;
};

/** The unsaved scores, kept in local storage per character so a refresh comes back to them */
interface ScoresDraft {
  method: Method;
  /** the chosen set, by when it was rolled (indices shift as old sets drop off) */
  setAt: string | null;
  placement: Placement;
  typed: Scores;
}

const draftKey = (id: string) => `DndBuildScores.draft.${id}`;

/** The kept sets, compared by when they were rolled: a reload with the same sets isn't a change */
const sameRolls = (a: AbilityRoll[], b: AbilityRoll[]) => a.length === b.length && a.every((r, i) => r.at === b[i].at);

/**
 * The base ability scores: the method the rules allow, the six scores, and the final scores the
 * sheet computes. Standard array and rolled place a pool of six values on the abilities (drag, or
 * each ability's select; taking a placed value swaps). The API checks the method's rules on save.
 */
@Component({
  selector: 'lib-dnd-build-scores',
  imports: [
    TitleWordsPipe,
    UpperCasePipe,
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatTooltipModule,
    DndSheetStatComponent,
  ],
  templateUrl: './build-scores.component.html',
  styleUrl: './build-scores.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DndBuildScoresComponent {
  protected readonly build = inject(DndCharacterBuildStore);

  private readonly storage = inject(SharedLocalStorageService);

  /** The character whose draft has been read back; nothing is stored before that */
  private readonly restoredFor = signal<string | null>(null);

  protected readonly abilities = ABILITIES;

  protected readonly methods = computed(
    () => this.build.character()?.rules.ability_score_methods ?? ['point_buy', 'standard_array', 'rolled', 'manual'],
  );

  private readonly budget = computed(() => this.build.character()?.rules.point_buy_budget ?? 27);

  protected readonly keptSets = computed(() => this.build.character()?.rules.rolled_sets_kept ?? 6);

  protected readonly rolls = computed(() => this.build.character()?.ability_rolls ?? [], { equal: sameRolls });

  /**
   * The saved method and scores, compared by value: other saves reload the character, and what's
   * being edited here should only follow a change to these
   */
  private readonly saved = computed(
    () => {
      const c = this.build.character();
      return { method: c?.ability_method ?? 'point_buy', scores: fullScores(c?.base_scores, 8) };
    },
    { equal: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
  );

  protected readonly method = linkedSignal<Method>(() => this.saved().method);

  /** Point buy and manual: the typed scores */
  protected readonly typedScores = linkedSignal(() => this.saved().scores);

  /** The set to place from: the one the saved scores came from, else the newest (a new roll picks it) */
  protected readonly rolledSet = linkedSignal<AbilityRoll[], number | null>({
    source: this.rolls,
    computation: (rolls, previous) => {
      if (!rolls.length) return null;
      if (previous?.value == null) {
        const index = this.savedSetIndex(rolls);
        if (index !== null) return index;
      }
      return rolls.length - 1;
    },
  });

  protected readonly range = computed(() => RANGE[this.method()] ?? [3, 18]);

  /** The values to place, for the methods that use a pool */
  protected readonly pool = computed(() => {
    if (this.method() === 'standard_array') return STANDARD_ARRAY;
    if (this.method() === 'rolled') {
      const set = this.rolledSet();
      return set === null ? [] : (this.rolls()[set]?.totals ?? []);
    }
    return null;
  });

  /** Starts from the saved scores when they fit the pool; a new pool (another set, a new roll) starts empty */
  protected readonly placement = linkedSignal(() => this.placementFromSaved());

  /** pool index -> the ability it's on */
  protected readonly owners = computed(() => {
    const out = new Map<number, AbilityCode>();
    for (const a of ABILITIES) {
      const index = this.placement()[a.code];
      if (index !== null) out.set(index, a.code);
    }
    return out;
  });

  /** The six scores being edited; null while a pool value is still unplaced */
  protected readonly scores = computed((): Scores | null => {
    const pool = this.pool();
    if (!pool) return this.typedScores();
    const out: Partial<Scores> = {};
    for (const a of ABILITIES) {
      const index = this.placement()[a.code];
      if (index === null) return null;
      out[a.code] = pool[index];
    }
    return out as Scores;
  });

  protected readonly changed = computed(() => {
    const saved = this.saved();
    const scores = this.scores();
    return saved.method !== this.method() || !scores || ABILITIES.some((a) => saved.scores[a.code] !== scores[a.code]);
  });

  /** Why the scores can't be saved yet, in the method's terms */
  protected readonly problem = computed((): string | null => {
    const pool = this.pool();
    if (pool) {
      if (!pool.length) return 'Roll a set first.';
      const left = pool.length - this.owners().size;
      return left ? `${left} of ${pool.length} still to place.` : null;
    }
    const values = ABILITIES.map((a) => this.typedScores()[a.code]);
    const [low, high] = this.range();
    if (values.some((v) => !Number.isInteger(v) || v < low || v > high)) return `Each score is ${low} to ${high}.`;
    if (this.method() === 'point_buy') {
      const spent = values.reduce((sum, v) => sum + (POINT_BUY_COST[v] ?? 0), 0);
      if (spent > this.budget()) return `Those cost ${spent} points; the budget is ${this.budget()}.`;
    }
    return null;
  });

  protected readonly status = computed(() => {
    if (this.method() !== 'point_buy') return this.changed() ? 'Not saved yet.' : 'Saved.';
    const spent = ABILITIES.reduce((sum, a) => sum + (POINT_BUY_COST[this.typedScores()[a.code]] ?? 0), 0);
    return `${this.budget() - spent} of ${this.budget()} points left.${this.changed() ? ' Not saved yet.' : ''}`;
  });

  /** A total's dice, highest first: "6 + 5 + 4, dropped 1" */
  protected diceText(roll: AbilityRoll | undefined, index: number): string {
    const dice = roll?.dice[index];
    return dice?.length ? `${dice.slice(0, 3).join(' + ')}, dropped ${dice[3]}` : '';
  }

  protected readonly activeRoll = computed(() =>
    this.method() === 'rolled' ? this.rolls()[this.rolledSet() ?? -1] : undefined,
  );

  constructor() {
    // once per character: back to the unsaved scores from before a refresh
    effect(() => {
      const id = this.build.character()?.id;
      if (!id || this.restoredFor() === id) return;
      untracked(() => this.restore(id));
      this.restoredFor.set(id);
    });
    // keep the draft while it differs from what's saved; Save or Reset drops it
    effect(() => {
      const id = this.restoredFor();
      if (!id) return;
      if (!this.changed()) {
        this.storage.remove(draftKey(id));
        return;
      }
      const set = this.rolledSet();
      this.storage.set<ScoresDraft>(draftKey(id), {
        method: this.method(),
        setAt: set === null ? null : (this.rolls()[set]?.at ?? null),
        placement: this.placement(),
        typed: this.typedScores(),
      });
    });
  }

  private restore(id: string): void {
    const draft = this.storage.get<ScoresDraft>(draftKey(id));
    if (!draft || !this.methods().includes(draft.method)) return;
    this.method.set(draft.method);
    this.typedScores.set(fullScores(draft.typed, 8));
    const set = this.rolls().findIndex((r) => r.at === draft.setAt);
    if (set >= 0) this.rolledSet.set(set);
    // only placements that still fit the pool (the set may have dropped off)
    const pool = this.pool() ?? [];
    const indices = ABILITIES.map((a) => draft.placement?.[a.code]).filter((i): i is number => typeof i === 'number');
    const fits =
      (draft.method !== 'rolled' || set >= 0) &&
      indices.every((i) => Number.isInteger(i) && i >= 0 && i < pool.length) &&
      new Set(indices).size === indices.length;
    this.placement.set(fits ? { ...emptyPlacement(), ...draft.placement } : emptyPlacement());
  }

  onMethod(method: Method): void {
    this.method.set(method);
    // point buy starts from all 8s, unless it's what's saved
    if (method === 'point_buy') {
      this.typedScores.set(this.saved().method === 'point_buy' ? this.saved().scores : fullScores(undefined, 8));
    }
    this.placement.set(this.placementFromSaved());
  }

  onRolledSet(index: number): void {
    this.rolledSet.set(index);
    this.placement.set(this.placementFromSaved());
  }

  onTyped(code: AbilityCode, value: number): void {
    this.typedScores.update((s) => ({ ...s, [code]: value }));
  }

  /** Puts pool value `index` on `code`; the ability that had it gets `code`'s old value */
  place(code: AbilityCode, index: number | null): void {
    this.placement.update((p) => {
      const next = { ...p };
      const from = index === null ? undefined : this.owners().get(index);
      if (from && from !== code) next[from] = p[code];
      next[code] = index;
      return next;
    });
  }

  onDropOnAbility(event: CdkDragDrop<AbilityCode>): void {
    this.place(event.container.data, event.item.data as number);
  }

  /** Dropped back on the row: unplaced */
  onDropOnRow(event: CdkDragDrop<string>): void {
    const owner = this.owners().get(event.item.data as number);
    if (owner) this.place(owner, null);
  }

  /** Every value back off the abilities (Reset goes back to what's saved instead) */
  onClearPlacements(): void {
    this.placement.set(emptyPlacement());
    if (this.build.previewLabel() === 'Ability scores') this.build.clearPreview();
  }

  onReset(): void {
    this.method.set(this.saved().method);
    this.typedScores.set(this.saved().scores);
    const index = this.savedSetIndex(this.rolls());
    if (index !== null) this.rolledSet.set(index);
    this.placement.set(this.placementFromSaved());
    this.build.clearPreview();
  }

  onPreview(): void {
    const body = this.body();
    if (body) this.build.previewChanges({ label: 'Ability scores', operations: [{ op: 'scores.set', body }] });
  }

  onSave(): void {
    const body = this.body();
    if (body) {
      this.build.write({ run: (api, id, version) => api.setAbilityScores(id, body, version), label: 'ability scores' });
    }
  }

  /** Stays on Rolled: the new set becomes the one to place from */
  onRoll(): void {
    this.build.write({ run: (api, id, version) => api.rollAbilityScores(id, version) });
  }

  private body(): DndCharacterModels.Build.AbilityScoresBody | null {
    const method = this.method();
    const scores = this.scores();
    if (!scores) return null;
    return { method, scores, ...(method === 'rolled' ? { rolled_set: this.rolledSet() } : {}) };
  }

  private placementFromSaved(): Placement {
    const pool = this.pool();
    const saved = this.saved();
    return pool && saved.method === this.method() ? placementOf(saved.scores, pool) : emptyPlacement();
  }

  /** The kept set the saved rolled scores came from */
  private savedSetIndex(rolls: AbilityRoll[]): number | null {
    const saved = this.saved();
    if (saved.method !== 'rolled') return null;
    const sorted = (values: number[]) => [...values].sort((a, b) => a - b).join(',');
    const scores = sorted(ABILITIES.map((a) => saved.scores[a.code]));
    const index = rolls.findIndex((r) => sorted(r.totals) === scores);
    return index < 0 ? null : index;
  }
}
