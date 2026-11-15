import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  Resource,
  ResourceRef,
  signal,
} from '@angular/core';
import { TitleCasePipe, UpperCasePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { pageMeta } from '@ttrpg-ui/shared/core/util';
import { getErrorMessage } from '@ttrpg-ui/shared/store/util';
import { titleWords } from '@ttrpg-ui/shared/util';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { DndCharacterApiService, DndCharactersStore } from '@ttrpg-ui/features/dnd/characters/data-access';
import { DndCampaignModels } from '@ttrpg-ui/features/dnd/campaigns/models';
import { DndCampaignApiService } from '@ttrpg-ui/features/dnd/campaigns/data-access';
import {
  choiceLabel,
  codeLabel,
  DndProficiencyMarkComponent,
  DndSheetStatComponent,
  signed,
  SpellNamePipe,
} from '@ttrpg-ui/features/dnd/characters/ui';
import { DndCharacterDetailsComponent } from '../../details/character-details.component';
import { DndInventoryComponent } from '../../inventory/inventory.component';
import { DndModifiersComponent } from '../../modifiers/modifiers.component';
import { DndCharacterSharingComponent } from '../../sharing/character-sharing.component';
import { DndPreparedSpellsComponent } from '../../spells/prepared-spells.component';

type Character = DndCharacterModels.Characters.CharacterDetail;
type Sheet = DndCharacterModels.Sheet.CharacterSheet;
type Choice = DndCharacterModels.Characters.CharacterChoice;

const { ABILITIES, SKILLS } = DndCharacterModels.Sheet;

/** `value()` throws while a resource is in error, so read it through this */
const valueOf = <T>(res: Resource<T | undefined>): T | undefined => (res.hasValue() ? res.value() : undefined);

const SEVERITY_ORDER = { error: 0, warning: 1, info: 2 };

/** A choice point's options in words: "from Arcana, History", "any Musical Instrument" */
const pointOptions = (p: DndCharacterModels.Sheet.ChoicePoint): string => {
  if (p.text) return p.text;
  if (p.any) return `any ${p.kinds.join(' or ')}`;
  return p.from?.length ? `from ${p.from.map(codeLabel).join(', ')}` : '';
};

/** The sheet in sections, with the build's own picks next to the choice points they answer */
const viewOf = (sheet: Sheet, character: Character) => {
  const choicesById = new Map(character.choices.map((c) => [c.id, c]));
  // only picks made by the viewed level (a subclass chosen at 3 isn't there at 1)
  const picked = (kind: string): Choice | undefined =>
    character.choices.find((c) => c.kind === kind && c.level <= sheet.level);
  const level = character.levels.find((l) => l.level === sheet.level) ?? character.levels.at(-1);
  const byLevel = new Map<number, DndCharacterModels.Sheet.Feature[]>();
  for (const f of sheet.features) byLevel.set(f.level, [...(byLevel.get(f.level) ?? []), f]);
  return {
    summary: [
      level ? `${level.class.name} ${sheet.level}` : `Level ${sheet.level}, no class yet`,
      picked('subclass')?.ref_name,
      picked('species')?.ref_name,
      picked('background')?.ref_name && `${picked('background')?.ref_name} background`,
    ]
      .filter(Boolean)
      .join(' · '),
    abilities: ABILITIES.map((a) => ({
      ...a,
      ...sheet.abilities[a.code],
      modifierText: signed(sheet.abilities[a.code].modifier),
    })),
    saves: ABILITIES.map((a) => ({ ...a, stat: sheet.saving_throws[a.code] })),
    skills: SKILLS.map((s) => ({ ...s, stat: sheet.skills[s.code] })).filter((s) => s.stat),
    speeds: Object.entries(sheet.speed).map(([kind, stat]) => ({ label: `${titleWords(kind)} speed`, stat })),
    senses: Object.entries(sheet.senses).map(([kind, stat]) => ({ label: titleWords(kind), stat })),
    passive: Object.entries(sheet.passive).map(([kind, stat]) => ({ label: `Passive ${titleWords(kind)}`, stat })),
    features: [...byLevel.entries()].sort(([a], [b]) => a - b).map(([lvl, features]) => ({ level: lvl, features })),
    proficiencies: Object.entries(sheet.proficiencies)
      .filter(([, list]) => list.length)
      .map(([kind, list]) => ({ kind: titleWords(kind), list: list.join(', ') })),
    // left out of the sheet when there's no class
    classTable: Object.entries(sheet.class_table ?? {}).map(([column, value]) => ({ column, value })),
    choicePoints: sheet.choice_points.map((p) => ({
      ...p,
      open: p.chosen < p.count,
      options: pointOptions(p),
      picks: (p.choice_ids ?? [])
        .map((id) => choicesById.get(id))
        .filter((c): c is Choice => !!c)
        .map(choiceLabel),
    })),
    issues: [...sheet.issues].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]),
    prepared: character.prepared_spells,
    // the class's own spell picks, by the choice points they answer
    classSpells: [
      { label: 'Cantrips', names: spellPicks(/:cantrips(:\d+|_known)$/) },
      { label: 'Learned', names: spellPicks(/:spells:\d+$/) },
      { label: 'Spellbook', names: spellPicks(/:spellbook:/) },
    ].filter((g) => g.names.length),
  };

  function spellPicks(slot: RegExp): string[] {
    return sheet.choice_points
      .filter((p) => slot.test(p.slot) && !p.granted_by_id)
      .flatMap((p) => (p.choice_ids ?? []).map((id) => choicesById.get(id)?.ref_name ?? '?'));
  }
};

@Component({
  selector: 'lib-page-dnd-characters-view',
  imports: [
    TitleCasePipe,
    UpperCasePipe,
    SpellNamePipe,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressBarModule,
    MatSelectModule,
    DndSheetStatComponent,
    DndPreparedSpellsComponent,
    DndProficiencyMarkComponent,
    DndInventoryComponent,
    DndModifiersComponent,
    DndCharacterDetailsComponent,
    DndCharacterSharingComponent,
  ],
  templateUrl: './page-dnd-characters-view.component.html',
  styleUrl: './page-dnd-characters-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDndCharactersViewComponent {
  private readonly router = inject(Router);

  protected readonly store = inject(DndCharactersStore);

  private readonly api = inject(DndCharacterApiService);

  private readonly campaignApi = inject(DndCampaignApiService);

  /** Route resource (`characterRouteResources`): the build */
  readonly character = input.required<ResourceRef<Character | undefined>>();

  /** Route resource: the computed sheet, at `?level=` or the current level */
  readonly sheet = input.required<ResourceRef<Sheet | undefined>>();

  /** The campaign it's in, for the header's link */
  protected readonly campaignOf = rxResource({
    params: () => this.shownCharacter()?.campaign_id ?? undefined,
    stream: ({ params: id }) => this.campaignApi.getById(id),
  });

  protected readonly campaignRoute = DndCampaignModels.Campaigns.campaignRoute;

  /** A prepared-spell toggle is saving */
  protected readonly savingSpell = signal(false);

  protected readonly spellError = signal<string | null>(null);

  protected readonly proficiencyLegend: { level: DndCharacterModels.Sheet.ProficiencyLevel; label: string }[] = [
    { level: 'none', label: 'not proficient' },
    { level: 'half', label: 'half proficiency' },
    { level: 'proficient', label: 'proficient' },
    { level: 'expertise', label: 'expertise' },
  ];

  /** Keep the last ones on screen while the next load, e.g. when switching the level */
  protected readonly shownCharacter = linkedSignal<Character | undefined, Character | undefined>({
    source: () => valueOf(this.character()),
    computation: (value, previous) => value ?? previous?.value,
  });

  protected readonly shownSheet = linkedSignal<Sheet | undefined, Sheet | undefined>({
    source: () => valueOf(this.sheet()),
    computation: (value, previous) => value ?? previous?.value,
  });

  protected readonly view = computed(() => {
    const sheet = this.shownSheet();
    const character = this.shownCharacter();
    return sheet && character ? viewOf(sheet, character) : undefined;
  });

  /** The owner and editors (an API without `viewer` predates sharing: the caller owns it) */
  protected readonly canEdit = computed(() => this.shownCharacter()?.viewer?.can_edit ?? true);

  /** The planned levels the sheet can be viewed at */
  protected readonly levels = computed(() => (this.shownCharacter()?.levels ?? []).map((l) => l.level));

  protected readonly errorMessage = computed(() => {
    const error = this.character().error() ?? this.sheet().error();
    if (!error) return null;
    return error instanceof HttpErrorResponse && error.status === 404 ? 'Character not found.' : getErrorMessage(error);
  });

  constructor() {
    pageMeta(() => {
      const character = this.shownCharacter();
      return {
        title: [character?.name ?? 'Character', 'Characters'],
        description: character ? `${character.name}'s character sheet.` : 'A character sheet.',
      };
    });
  }

  /** Views the sheet at another planned level; the current level drops the query param */
  onLevelSelected(level: number): void {
    const current = this.shownCharacter()?.current_level;
    this.router.navigate([], {
      queryParams: { level: level === current ? null : level },
      queryParamsHandling: 'merge',
    });
  }

  /** Prepares or unprepares one spell (If-Match the shown version), then reloads the build and sheet */
  onSpellToggled(character: Character, { spellId, prepare }: { spellId: string; prepare: boolean }): void {
    this.savingSpell.set(true);
    this.spellError.set(null);
    const write = prepare
      ? this.api.prepareSpell(character.id, spellId, character.version)
      : this.api.unprepareSpell(character.id, spellId, character.version);
    write.subscribe({
      next: () => this.reloadAfterSpell(),
      error: (error: unknown) => {
        this.spellError.set(getErrorMessage(error));
        this.reloadAfterSpell();
      },
    });
  }

  /** After a spell, inventory, modifier or details write: the build and sheet again */
  protected reloadAfterSpell(): void {
    this.savingSpell.set(false);
    this.character().reload();
    this.sheet().reload();
  }

  /** An editor took themselves off: it may not be theirs to see now */
  onStoppedEditing(): void {
    this.router.navigate(['/', 'dnd', 'characters']);
  }

  onDeleteClicked(character: Character): void {
    if (!confirm(`Delete ${character.name}?`)) return;
    this.store.delete({ entity: character, onDeleted: () => this.router.navigate(['/', 'dnd', 'characters']) });
  }
}
