import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { DndCharacterApiService } from '@ttrpg-ui/features/dnd/characters/data-access';

type Character = DndCharacterModels.Characters.CharacterDetail;
type Sheet = DndCharacterModels.Sheet.CharacterSheet;
type Option = DndCharacterModels.Build.CharacterOption;

/** Prepared only (the default), the spellbook's (the spellbook rule), or every spell the class can prepare */
type View = 'prepared' | 'spellbook' | 'all';

interface Row {
  id: string;
  name: string;
  level: number;
  prepared: boolean;
  /** in the spellbook; undefined when the spellbook rule is off */
  learned?: boolean;
  /** the catalog's source, for an entry from the options list */
  source?: string;
}

/** Compares params by value, so a new object with the same values doesn't refetch */
const sameJson = <T>(a: T, b: T) => JSON.stringify(a) === JSON.stringify(b);

/**
 * A preparing class's level 1+ spells at the current level: the prepared ones (the default), or
 * every spell it can prepare, to tick on and off. The counts are the sheet's, and over or under the
 * limit is only a warning. Under the spellbook rule the spellbook's spells come first, and one
 * outside it can still be prepared (the sheet flags it). Emits each toggle; the page saves it.
 */
@Component({
  selector: 'lib-dnd-prepared-spells',
  imports: [MatButtonToggleModule, MatCheckboxModule, MatFormFieldModule, MatInputModule],
  templateUrl: './prepared-spells.component.html',
  styleUrl: './prepared-spells.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DndPreparedSpellsComponent {
  private readonly api = inject(DndCharacterApiService);

  readonly character = input.required<Character>();

  /** The sheet at the current level: its limit and casting */
  readonly sheet = input.required<Sheet>();

  readonly saving = input(false);

  readonly toggled = output<{ spellId: string; prepare: boolean }>();

  protected readonly view = signal<View>('prepared');

  protected readonly nameFilter = signal('');

  /** What the list depends on: the level, the class, the rules and the spellbook's picks (not every save) */
  private readonly optionsParams = computed(
    () => {
      const c = this.character();
      if (this.sheet().spellcasting?.change !== 'long_rest') return undefined;
      return {
        id: c.id,
        level: c.current_level,
        classId: c.levels[0]?.class.id,
        rules: c.rules,
        book: c.choices
          .filter((ch) => ch.slot.includes(':spellbook:'))
          .map((ch) => ch.id)
          .sort(),
      };
    },
    { equal: sameJson },
  );

  protected readonly options = rxResource({
    params: this.optionsParams,
    stream: ({ params }) => this.api.getOptions(params.id, 'spell', { level: params.level }),
  });

  /** The last loaded list, kept while it reloads */
  private readonly loaded = linkedSignal<Option[] | undefined, Option[]>({
    source: () => (this.options.hasValue() ? this.options.value().entities : undefined),
    computation: (entities, previous) => entities ?? previous?.value ?? [],
  });

  protected readonly groups = computed(() => {
    const prepared = new Set(this.character().prepared_spells.map((p) => p.spell_id));
    const rule = !!this.sheet().spellcasting?.spellbook_rule;
    const byId = new Map(this.loaded().map((o) => [o.id, o]));
    const fromOption = (o: Option): Row => ({
      id: o.id,
      name: o.name,
      level: o.level ?? 0,
      prepared: prepared.has(o.id),
      learned: rule ? !!o.learned : undefined,
      source: `${o.source_slug.replaceAll('_', ' ')}`,
    });
    const preparedRows: Row[] = this.character().prepared_spells.map((p) => ({
      id: p.spell_id,
      name: p.spell_name,
      level: p.spell_level,
      prepared: true,
      learned: rule && byId.has(p.spell_id) ? !!byId.get(p.spell_id)?.learned : undefined,
    }));
    let rows: Row[];
    switch (this.view()) {
      case 'prepared':
        rows = preparedRows;
        break;
      case 'spellbook':
        rows = this.loaded()
          .filter((o) => o.learned)
          .map(fromOption);
        break;
      default:
        // what it can prepare, plus anything prepared that the list doesn't have (above the highest slot)
        rows = [
          ...this.loaded()
            .filter((o) => o.allowed || prepared.has(o.id))
            .map(fromOption),
          ...preparedRows.filter((r) => !byId.has(r.id)),
        ];
    }
    const name = this.nameFilter().trim().toLowerCase();
    if (name) rows = rows.filter((r) => r.name.toLowerCase().includes(name));
    const levels = [...new Set(rows.map((r) => r.level))].sort((a, b) => a - b);
    return levels.map((level) => ({
      level,
      // the spellbook's first under the rule, then by name
      rows: rows
        .filter((r) => r.level === level)
        .sort((a, b) => Number(b.learned ?? false) - Number(a.learned ?? false) || a.name.localeCompare(b.name)),
    }));
  });
}
