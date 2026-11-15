import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { pageMeta } from '@ttrpg-ui/shared/core/util';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { DndCharacterApiService, DndCharacterBuildStore } from '@ttrpg-ui/features/dnd/characters/data-access';
import {
  choiceLabel,
  ChoiceLabelPipe,
  DndSheetChangesComponent,
  DndSheetStatComponent,
  sheetChanges,
  SignedPipe,
} from '@ttrpg-ui/features/dnd/characters/ui';
import { DndBuildChoicePointComponent } from '../../builder/build-choice-point.component';
import { DndBuildEntryPickerComponent } from '../../builder/build-entry-picker.component';
import { DndBuildLevelsComponent } from '../../builder/build-levels.component';
import { DndBuildScoresComponent } from '../../builder/build-scores.component';
import { removeChoiceWrite } from '../../builder/build-ops';
import { DndPreparedSpellsComponent } from '../../spells/prepared-spells.component';

type Choice = DndCharacterModels.Characters.CharacterChoice;
type Sheet = DndCharacterModels.Sheet.CharacterSheet;

/** The origin picks have their own pickers above the list */
const ORIGIN_SLOTS = new Set(['origin:species', 'origin:background']);

/**
 * The builder: class, species, background, ability scores, the planned levels, then every pick
 * those ask for up to the plan's top level. Each pick previews the sheet before it's saved, and the
 * panel shows what it would change.
 */
@Component({
  selector: 'lib-page-dnd-characters-build',
  imports: [
    UpperCasePipe,
    ChoiceLabelPipe,
    SignedPipe,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatSlideToggleModule,
    DndBuildChoicePointComponent,
    DndBuildEntryPickerComponent,
    DndBuildLevelsComponent,
    DndBuildScoresComponent,
    DndSheetChangesComponent,
    DndSheetStatComponent,
    DndPreparedSpellsComponent,
  ],
  templateUrl: './page-dnd-characters-build.component.html',
  styleUrl: './page-dnd-characters-build.component.scss',
  providers: [DndCharacterBuildStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDndCharactersBuildComponent {
  protected readonly build = inject(DndCharacterBuildStore);

  private readonly api = inject(DndCharacterApiService);

  /** The `:id` route param */
  readonly id = input.required<string>();

  protected readonly abilities = DndCharacterModels.Sheet.ABILITIES;

  /** The picks below the origin pickers, by the level that asks for them */
  protected readonly pointsByLevel = computed(() => {
    const points = (this.build.sheet()?.choice_points ?? []).filter((p) => !ORIGIN_SLOTS.has(p.slot));
    const levels = [...new Set(points.map((p) => p.level))].sort((a, b) => a - b);
    return levels.map((level) => ({ level, points: points.filter((p) => p.level === level) }));
  });

  protected readonly openCount = computed(
    () => (this.build.sheet()?.choice_points ?? []).filter((p) => p.chosen < p.count).length,
  );

  /** What the previewed pick would change */
  protected readonly changes = computed(() => {
    const sheet = this.build.sheet();
    const preview = this.build.preview();
    return sheet && preview ? sheetChanges(sheet, preview) : null;
  });

  /** What the last labelled save changed */
  protected readonly savedChanges = computed(() => {
    const saved = this.build.lastSave();
    const sheet = this.build.sheet();
    return saved && sheet ? sheetChanges(saved.before, sheet) : null;
  });

  protected readonly className = computed(() => this.build.character()?.levels[0]?.class.name ?? null);

  /** The API's error, with the choice ids it names ("granted 4 other choices: 01a1...") as the picks' names */
  protected readonly errorText = computed(() => {
    const error = this.build.error();
    if (!error) return null;
    const choices = this.build.choicesById();
    return error.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g, (id) => {
      const choice = choices.get(id);
      return choice ? choiceLabel(choice) : id;
    });
  });

  /** The sheet at the current level, when the builder's is at a planned level above it */
  private readonly currentLevelSheet = rxResource({
    params: computed(
      () => {
        const c = this.build.character();
        if (!c || c.current_level === this.build.buildLevel()) return undefined;
        return { id: c.id, level: c.current_level, version: c.version };
      },
      { equal: (a, b) => JSON.stringify(a) === JSON.stringify(b) },
    ),
    stream: ({ params }) => this.api.getSheet(params.id, params.level),
  });

  /** The last one loaded, kept while the next loads */
  private readonly loadedCurrentSheet = linkedSignal<Sheet | undefined, Sheet | undefined>({
    source: () => (this.currentLevelSheet.hasValue() ? this.currentLevelSheet.value() : undefined),
    computation: (sheet, previous) => sheet ?? previous?.value,
  });

  /** Prepared spells are the current level's: the sheet there (the builder's own when it's the same level) */
  protected readonly currentSheet = computed(() => {
    const c = this.build.character();
    if (!c) return null;
    if (c.current_level === this.build.buildLevel()) return this.build.sheet();
    return this.loadedCurrentSheet() ?? null;
  });

  constructor() {
    effect(() => this.build.load(this.id()));
    pageMeta(() => ({
      title: [`Build ${this.build.character()?.name ?? 'character'}`, 'Characters'],
      description: 'Build a character: class, species, background, ability scores, levels and their picks.',
    }));
  }

  onRemoveOrphan(choice: Choice): void {
    this.build.write({ run: removeChoiceWrite(choice) });
  }

  onSpellToggled({ spellId, prepare }: { spellId: string; prepare: boolean }): void {
    this.build.write({
      run: (api, id, version) =>
        prepare ? api.prepareSpell(id, spellId, version) : api.unprepareSpell(id, spellId, version),
    });
  }

  /** The spellbook rule on the character's own rules (a campaign's are the DM's) */
  onSpellbookRule(on: boolean): void {
    this.build.write({
      run: (api, id, version) => api.patch(id, { rules: { optional_rules: { spellbook: on } } }, version),
    });
  }
}
