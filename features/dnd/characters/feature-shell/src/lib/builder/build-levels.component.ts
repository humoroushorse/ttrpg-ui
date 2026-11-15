import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { DndCharacterBuildStore } from '@ttrpg-ui/features/dnd/characters/data-access';
import { DndSheetStatComponent } from '@ttrpg-ui/features/dnd/characters/ui';

type Level = DndCharacterModels.Characters.CharacterLevel;
type HpMethod = DndCharacterModels.Characters.HpMethod;

const HP_METHODS: HpMethod[] = ['average', 'rolled', 'manual'];

/** The preview label for planning level `n`, so the button knows its own preview */
const planLabel = (n: number, className: string): string => `level ${n} (${className})`;

/**
 * The planned levels: the current level, each level's hit points (average, rolled or manual; level 1
 * is the die's maximum) and what it gains, planning the next level and removing the top one. The
 * HP numbers are the sheet's.
 */
@Component({
  selector: 'lib-dnd-build-levels',
  imports: [
    TitleCasePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    DndSheetStatComponent,
  ],
  templateUrl: './build-levels.component.html',
  styleUrl: './build-levels.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DndBuildLevelsComponent {
  protected readonly build = inject(DndCharacterBuildStore);

  // the drafts last until the next save lands, so a saving row doesn't flick back to its old value

  /** A method picked but not saved yet (manual, waiting for its value), by level */
  private readonly draftMethod = linkedSignal<number | undefined, Record<number, HpMethod>>({
    source: () => this.build.character()?.version,
    computation: () => ({}),
  });

  /** A manual value typed but not saved yet, by level */
  private readonly draftValue = linkedSignal<number | undefined, Record<number, number>>({
    source: () => this.build.character()?.version,
    computation: () => ({}),
  });

  private readonly className = computed(() => this.build.character()?.levels[0]?.class.name ?? '');

  /** The class's hit die, from the sheet's hit dice ("4d6") */
  protected readonly die = computed(
    () => Number(/d(\d+)/.exec(this.build.sheet()?.hit_points.hit_dice ?? '')?.[1]) || 0,
  );

  private readonly ruleMethods = computed(() => this.build.character()?.rules.hp_methods ?? HP_METHODS);

  /** Level -> its hit die's part of max HP, from the sheet's breakdown ("Level 3 (average d6)") */
  private readonly hpByLevel = computed(() => {
    const out = new Map<number, number>();
    for (const c of this.build.sheet()?.hit_points.max.contributions ?? []) {
      const level = /^Level (\d+) /.exec(c.source)?.[1];
      if (level) out.set(Number(level), c.value);
    }
    return out;
  });

  protected readonly currentLevelOptions = computed(() => {
    const c = this.build.character();
    const top = Math.max(this.build.topLevel(), c?.current_level ?? 1);
    return Array.from({ length: top }, (_, i) => i + 1);
  });

  /** The level to plan next, if there is one */
  protected readonly nextLevel = computed(() => {
    const top = this.build.topLevel();
    return top > 0 && top < 20 ? top + 1 : null;
  });

  /** Whether the preview showing is this card's plan for the next level */
  protected readonly planning = computed(() => {
    const n = this.nextLevel();
    return !!n && this.build.previewLabel() === planLabel(n, this.className());
  });

  protected hpValue(level: number): number | undefined {
    return this.hpByLevel().get(level);
  }

  protected method(l: Level): HpMethod {
    return this.draftMethod()[l.level] ?? l.hp_method;
  }

  /** The rules' methods, plus the level's own if the rules have changed since */
  protected methodsFor(l: Level): HpMethod[] {
    const allowed = this.ruleMethods();
    return HP_METHODS.filter((m) => allowed.includes(m) || m === l.hp_method);
  }

  protected manualValue(l: Level): number | null {
    return this.draftValue()[l.level] ?? (l.hp_method === 'manual' ? l.hp_value : (this.hpValue(l.level) ?? null));
  }

  protected manualChanged(l: Level): boolean {
    return l.hp_method !== 'manual' || (l.level in this.draftValue() && this.draftValue()[l.level] !== l.hp_value);
  }

  protected validManual(l: Level): boolean {
    const v = this.manualValue(l);
    return v !== null && Number.isInteger(v) && v >= 1 && (!this.die() || v <= this.die());
  }

  protected rollsText(l: Level): string {
    const rolls = l.hp_rolls ?? [];
    const last = rolls.at(-1);
    if (!last) return '';
    return rolls.length === 1
      ? `rolled on a d${last.die}`
      : `rolled ${rolls.length} times on a d${last.die}; the last counts`;
  }

  /** What the sheet gains at a level: its features */
  protected gains(level: number): string {
    return (this.build.sheet()?.features ?? [])
      .filter((f) => f.level === level)
      .map((f) => f.name)
      .join(', ');
  }

  /** The picks a level asks for that aren't made yet */
  protected openAt(level: number): number {
    return (this.build.sheet()?.choice_points ?? []).filter((p) => p.level === level && p.chosen < p.count).length;
  }

  onCurrentLevel(level: number): void {
    this.build.write({ run: (api, id, version) => api.patch(id, { current_level: level }, version) });
  }

  onMethod(l: Level, method: HpMethod): void {
    this.clearDrafts(l);
    if (method === l.hp_method) return;
    if (method === 'manual') {
      this.draftMethod.update((d) => ({ ...d, [l.level]: 'manual' }));
    } else if (method === 'rolled') {
      this.onRoll(l);
    } else {
      this.build.write({ run: (api, id, version) => api.setLevel(id, l.level, { hp_method: 'average' }, version) });
    }
  }

  onManualValue(l: Level, value: number): void {
    this.draftValue.update((d) => ({ ...d, [l.level]: value }));
  }

  onSaveManual(l: Level): void {
    const value = this.manualValue(l);
    this.build.write({
      run: (api, id, version) => api.setLevel(id, l.level, { hp_method: 'manual', hp_value: value }, version),
    });
  }

  onCancelManual(l: Level): void {
    this.clearDrafts(l);
  }

  onRoll(l: Level): void {
    this.build.write({ run: (api, id, version) => api.rollLevelHp(id, l.level, version) });
  }

  /** Plans the next level with the class every level has; its HP method is the rules' default */
  onPlan(n: number): void {
    const classId = this.build.character()?.levels[0]?.class.id;
    if (!classId) return;
    this.build.previewChanges({
      label: planLabel(n, this.className()),
      operations: [{ op: 'level.set', level: n, body: { class_id: classId } }],
      level: Math.max(this.build.buildLevel(), n),
    });
  }

  onSavePlan(n: number): void {
    const classId = this.build.character()?.levels[0]?.class.id;
    if (!classId) return;
    this.build.write({ run: (api, id, version) => api.setLevel(id, n, { class_id: classId }, version) });
  }

  /**
   * Removes the top level. Its picks stay, listed as unplanned, and count again if it's planned
   * again; its HP rolls are lost. A current level on it moves down with it.
   */
  onRemoveTop(l: Level): void {
    const lowerCurrent = this.build.character()?.current_level === l.level;
    this.build.write({
      run: (api, id, version) => {
        const removed = api.deleteLevel(id, l.level, version);
        return lowerCurrent
          ? removed.pipe(switchMap((c) => api.patch(id, { current_level: l.level - 1 }, c.version)))
          : removed;
      },
    });
  }

  private clearDrafts(l: Level): void {
    const without = <T>(drafts: Record<number, T>) =>
      Object.fromEntries(Object.entries(drafts).filter(([level]) => Number(level) !== l.level));
    this.draftMethod.update(without);
    this.draftValue.update(without);
  }
}
