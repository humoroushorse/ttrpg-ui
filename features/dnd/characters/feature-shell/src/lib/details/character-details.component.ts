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
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { getErrorMessage } from '@ttrpg-ui/shared/store/util';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { DndCharacterApiService } from '@ttrpg-ui/features/dnd/characters/data-access';

type Character = DndCharacterModels.Characters.CharacterDetail;
type Details = DndCharacterModels.Characters.CharacterDetails;
type TextKey = Exclude<keyof Details, 'portrait'>;

/** The details in the sheet's order; `long` ones are a few lines of text */
const FIELDS: { key: TextKey; label: string; long: boolean }[] = [
  { key: 'alignment', label: 'Alignment', long: false },
  { key: 'personality', label: 'Personality traits', long: true },
  { key: 'ideals', label: 'Ideals', long: true },
  { key: 'bonds', label: 'Bonds', long: true },
  { key: 'flaws', label: 'Flaws', long: true },
  { key: 'appearance', label: 'Appearance', long: true },
  { key: 'backstory', label: 'Backstory', long: true },
];

/**
 * The character's name and details (alignment, personality, backstory, ...): read, or Edit to change
 * them (owner and editors). Save sends the version shown (If-Match); `changed` asks the page to reload.
 */
@Component({
  selector: 'lib-dnd-character-details',
  imports: [TextFieldModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './character-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DndCharacterDetailsComponent {
  private readonly api = inject(DndCharacterApiService);

  readonly character = input.required<Character>();

  readonly changed = output<void>();

  protected readonly fields = FIELDS;

  protected readonly editing = signal(false);

  protected readonly saving = signal(false);

  protected readonly error = signal<string | null>(null);

  /** The owner and editors (an API without `viewer` predates sharing: the caller owns it) */
  protected readonly canEdit = computed(() => this.character().viewer?.can_edit ?? true);

  protected readonly name = linkedSignal(() => this.character().name);

  protected readonly draft = linkedSignal<Details>(() => ({ ...this.character().details }));

  /** The details that have text, for reading */
  protected readonly filled = computed(() =>
    FIELDS.map((f) => ({ ...f, text: this.character().details[f.key]?.trim() ?? '' })).filter((f) => f.text),
  );

  onField(key: TextKey, value: string): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  onEdit(): void {
    this.name.set(this.character().name);
    this.draft.set({ ...this.character().details });
    this.editing.set(true);
  }

  onCancel(): void {
    this.editing.set(false);
    this.error.set(null);
  }

  onSave(): void {
    const c = this.character();
    const name = this.name().trim();
    if (!name) return;
    // keeps what the form doesn't show (portrait); an emptied field is dropped
    const details: Details = { ...c.details };
    for (const f of FIELDS) {
      const text = this.draft()[f.key]?.trim();
      if (text) details[f.key] = text;
      else delete details[f.key];
    }
    this.saving.set(true);
    this.error.set(null);
    this.api.patch(c.id, { name, details }, c.version).subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(false);
        this.changed.emit();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.error.set(getErrorMessage(error));
      },
    });
  }
}
