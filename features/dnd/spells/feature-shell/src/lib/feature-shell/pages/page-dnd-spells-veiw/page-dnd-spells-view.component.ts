import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  Resource,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { getErrorMessage } from '@ttrpg-ui/shared/store/util';
import { DndSpellModels } from '@ttrpg-ui/features/dnd/spells/models';

type Spell = DndSpellModels.Spells.SpellSchema;

type Stat = { label: string; value: string };

/** Search results cut descriptions off around here */
const META_DESCRIPTION_LENGTH = 155;

/** `value()` throws while a resource is in error, so read it through this */
const valueOf = <T>(res: Resource<T | undefined>): T | undefined => (res.hasValue() ? res.value() : undefined);

const words = (value: string): string => value.replaceAll('_', ' ');

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

const count = (amount: number | null, unit: string): string =>
  amount === null ? words(unit) : `${amount} ${words(unit)}${amount === 1 ? '' : 's'}`;

const yesNo = (value: boolean | null): string => (value === null ? '?' : value ? 'Yes' : 'No');

const ordinal = (n: number): string => `${n}${({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n] ?? 'th'}`;

/** Worded like the spell's own book: "3rd-level evocation (ritual)" (2014), "Level 3 Evocation" (2024) */
const levelSchool = (spell: Spell): string => {
  if (spell.dnd_version_year >= 2024) {
    const school = capitalize(spell.school);
    return spell.level === 0 ? `${school} Cantrip` : `Level ${spell.level} ${school}`;
  }
  const line = spell.level === 0 ? `${capitalize(spell.school)} cantrip` : `${ordinal(spell.level)}-level ${spell.school}`;
  return spell.is_ritual ? `${line} (ritual)` : line;
};

/** The book's upcast heading, by edition */
const higherLevelsLead = (spell: Spell): string => {
  if (spell.dnd_version_year < 2024) return 'At Higher Levels.';
  return spell.level === 0 ? 'Cantrip Upgrade.' : 'Using a Higher-Level Spell Slot.';
};

/**
 * Description, then the upcast paragraph, as one HTML string so `.g-prose` spaces them as siblings.
 * Still sanitized by `[innerHTML]`.
 */
const bodyHtml = (spell: Spell): string =>
  spell.at_higher_levels
    ? `${spell.description}<p><strong><em>${higherLevelsLead(spell)}</em></strong> ${spell.at_higher_levels}</p>`
    : spell.description;

/** "Player's Handbook (2024), p. 241": the year tells the 2014 and 2024 books apart */
const sourceLine = (spell: Spell): string =>
  [
    `${spell.source.name} (${spell.dnd_version_year})`,
    spell.source_page && `p. ${spell.source_page}`,
    spell.is_homebrew && 'Homebrew',
  ]
    .filter(Boolean)
    .join(', ');

const printingLabel = (spell: Spell): string =>
  [`${spell.source.name_short} (${spell.dnd_version_year})`, spell.is_homebrew && 'Homebrew'].filter(Boolean).join(' · ');

const components = (spell: Spell): string =>
  [
    spell.has_verbal_component && 'V',
    spell.has_somatic_component && 'S',
    spell.has_material_component && (spell.materials ? `M (${spell.materials})` : 'M'),
  ]
    .filter(Boolean)
    .join(', ') || 'None';

/** Book order, then D&D Beyond's attack/save and damage when the spell has them */
const castingStats = (spell: Spell): Stat[] =>
  [
    { label: 'Casting Time', value: spell.casting_time },
    { label: 'Range', value: spell.range },
    { label: 'Components', value: components(spell) },
    { label: 'Duration', value: spell.duration },
    {
      label: 'Attack/Save',
      value: [spell.has_attack_roll && 'Attack Roll', spell.difficulty_class_type && `${spell.difficulty_class_type.toUpperCase()} Save`]
        .filter(Boolean)
        .join(', '),
    },
    { label: 'Damage', value: spell.damage_type ? capitalize(spell.damage_type) : '' },
  ].filter((stat) => stat.value);

/** The columns the database generates from `vtt`, i.e. what the VTT read from the spell text */
const vttStats = (spell: Spell): Stat[] => [
  {
    label: 'Activation',
    value: spell.activation_cost ? count(spell.activation_amount, spell.activation_cost) : '?',
  },
  {
    label: 'Range',
    value: spell.range_kind === 'distance' ? `${spell.range_feet} ft` : words(spell.range_kind ?? '?'),
  },
  {
    label: 'Duration',
    value:
      spell.duration_kind === 'timed' && spell.duration_unit
        ? count(spell.duration_amount, spell.duration_unit)
        : words(spell.duration_kind ?? '?'),
  },
  { label: 'Sustain', value: spell.sustain ? capitalize(words(spell.sustain)) : 'None' },
  { label: 'Attack Roll', value: yesNo(spell.has_attack_roll) },
  { label: 'Save', value: yesNo(spell.has_save) },
  { label: 'Summons', value: yesNo(spell.has_summon) },
];

/** The description as plain text, cut at a word for the meta description */
const metaDescription = (spell: Spell): string => {
  const text = spell.description
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= META_DESCRIPTION_LENGTH) return text;
  return `${text.slice(0, text.lastIndexOf(' ', META_DESCRIPTION_LENGTH))}…`;
};

@Component({
  selector: 'lib-page-dnd-spells-view',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressBarModule,
    MatSelectModule,
  ],
  templateUrl: './page-dnd-spells-view.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './page-dnd-spells-view.component.scss',
})
export class PageDndSpellsViewComponent {
  private readonly meta = inject(Meta);

  private readonly title = inject(Title);

  private readonly router = inject(Router);

  private readonly appTitle = inject(SharedCoreService).appTitle;

  /** Route resource (`spellRouteResources`) */
  readonly spell = input.required<Resource<Spell | undefined>>();

  /** Route resource: every printing of the spell, this one included */
  readonly versions = input.required<Resource<Spell[] | undefined>>();

  /** Keeps the last spell on screen while the next one loads, e.g. when switching printings */
  private readonly shown = linkedSignal<Spell | undefined, Spell | undefined>({
    source: () => valueOf(this.spell()),
    computation: (spell, previous) => spell ?? previous?.value,
  });

  protected readonly view = computed(() => {
    const spell = this.shown();
    if (!spell) return undefined;
    return {
      spell,
      sourceLine: sourceLine(spell),
      levelSchool: levelSchool(spell),
      castingStats: castingStats(spell),
      bodyHtml: bodyHtml(spell),
      vttStats: vttStats(spell),
    };
  });

  protected readonly errorMessage = computed(() => {
    const error = this.spell().error();
    if (!error) return null;
    return error instanceof HttpErrorResponse && error.status === 404 ? 'Spell not found.' : getErrorMessage(error);
  });

  /** Same idea as `shown`: the printings don't blink while the next spell's list loads */
  private readonly lastVersions = linkedSignal<Spell[] | undefined, Spell[]>({
    source: () => valueOf(this.versions()),
    computation: (versions, previous) => versions ?? previous?.value ?? [],
  });

  /** Every printing of the shown spell, newest first; empty while the kept list belongs to another spell */
  protected readonly printings = computed(() => {
    const id = this.shown()?.id;
    const versions = this.lastVersions();
    if (!versions.some((v) => v.id === id)) return [];
    return [...versions]
      .sort((a, b) => b.dnd_version_year - a.dnd_version_year)
      .map((spell) => ({ spell, label: printingLabel(spell) }));
  });

  constructor() {
    // the document head lives outside Angular's templates, so it needs an effect
    effect(() => {
      const spell = this.shown();
      const name = spell ? `${spell.name} (${spell.source.name_short} ${spell.dnd_version_year})` : 'Spell';
      this.title.setTitle(`${name} | D&D Spells | ${this.appTitle}`);
      this.meta.updateTag({ name: 'description', content: spell ? metaDescription(spell) : 'View a D&D spell.' });
    });
  }

  /** The kept spell and the list's copy are different objects */
  protected readonly sameSpell = (a: Spell | null, b: Spell | null): boolean => a?.id === b?.id;

  onPrintingSelected(spell: Spell): void {
    this.router.navigate(DndSpellModels.Spells.spellRoute(spell));
  }
}
