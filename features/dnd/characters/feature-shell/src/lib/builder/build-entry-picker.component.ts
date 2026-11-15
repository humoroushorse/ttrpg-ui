import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { DndCharacterApiService, DndCharacterBuildStore } from '@ttrpg-ui/features/dnd/characters/data-access';
import { SharedFormsSingleSelectAutocompleteComponent } from '@ttrpg-ui/shared/forms/ui';
import {
  choiceBody,
  choiceOperation,
  choiceWrite,
  classOperation,
  classWrite,
  originPoint,
  searchOptions,
} from './build-ops';

type Option = DndCharacterModels.Build.CharacterOption;

/** The entry the box shows: the character's own has only a name (a class also its source) */
type Shown = Pick<Option, 'id' | 'name'> & Partial<Option>;

/** "Elf (PHB 2024)": the source and year tell printings apart */
const optionLabel = (o: Shown): string =>
  o.source_slug ? `${o.name} (${o.source_slug.replaceAll('_', ' ')}, ${o.dnd_version_year})` : o.name;

/**
 * Picks the class, species or background from the catalog entries the character's rules allow.
 * Choosing one previews the sheet; Save writes it. Not-allowed entries show their reasons.
 */
@Component({
  selector: 'lib-dnd-build-entry-picker',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    SharedFormsSingleSelectAutocompleteComponent,
  ],
  templateUrl: './build-entry-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DndBuildEntryPickerComponent {
  protected readonly build = inject(DndCharacterBuildStore);

  private readonly api = inject(DndCharacterApiService);

  readonly kind = input.required<'class' | 'species' | 'background'>();

  readonly label = input.required<string>();

  protected readonly showAll = signal(false);

  /** The entry chosen but not saved yet */
  protected readonly selected = signal<Option | null>(null);

  protected readonly optionLabel = optionLabel;

  protected readonly blocked = (o: Option): boolean => !o.allowed;

  /** A new search after each save: "chosen" and the rules' answers can change */
  protected readonly search = computed(() => {
    const character = this.build.character();
    return character ? searchOptions(this.api, character.id, this.kind(), { allowed: !this.showAll() }) : null;
  });

  /** What the character has now */
  private readonly existing = computed(() =>
    this.kind() === 'class' ? undefined : this.build.character()?.choices.find((c) => c.kind === this.kind()),
  );

  protected readonly current = computed((): Shown | null => {
    if (this.kind() === 'class') return this.build.character()?.levels[0]?.class ?? null;
    const choice = this.existing();
    const id = choice?.species_id ?? choice?.background_id;
    return id ? { id, name: choice?.ref_name ?? '' } : null;
  });

  constructor() {
    // a save elsewhere clears the preview; drop the pending pick with it
    effect(() => {
      if (!this.build.preview() && !this.build.previewing()) this.selected.set(null);
    });
  }

  onSelected(option: Option | null): void {
    if (!option || option.id === this.current()?.id) {
      this.onCancel();
      return;
    }
    this.selected.set(option);
    this.build.previewChanges({ label: `${this.label()}: ${option.name}`, operations: [this.operation(option)] });
  }

  onSave(option: Option): void {
    const kind = this.kind();
    const label = `${this.label()}: ${option.name}`;
    if (kind === 'class') {
      this.build.write({ run: classWrite(option.id, !!this.build.character()?.levels.length), label });
    } else {
      this.build.write({
        run: choiceWrite(choiceBody(originPoint(kind), kind, { refId: option.id }), this.existing()),
        label,
      });
    }
  }

  onCancel(): void {
    this.selected.set(null);
    this.build.clearPreview();
  }

  private operation(option: Option): DndCharacterModels.Build.SheetOperation {
    const kind = this.kind();
    if (kind === 'class') return classOperation(option.id, !!this.build.character()?.levels.length);
    return choiceOperation(choiceBody(originPoint(kind), kind, { refId: option.id }), this.existing());
  }
}
