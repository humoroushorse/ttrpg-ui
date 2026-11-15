import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Observable } from 'rxjs';
import { getErrorMessage } from '@ttrpg-ui/shared/store/util';
import { SharedFormsSingleSelectComponent } from '@ttrpg-ui/shared/forms/ui';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { DndCharacterApiService } from '@ttrpg-ui/features/dnd/characters/data-access';
import { CodeLabelPipe, codeLabel, signed } from '@ttrpg-ui/features/dnd/characters/ui';

type Character = DndCharacterModels.Characters.CharacterDetail;
type Modifier = DndCharacterModels.Characters.CharacterModifier;
type Op = DndCharacterModels.Characters.ModifierOp;

/** What an effect needs: a number on a target, a roll on a target, a damage type, or AC's base */
type EffectKind = 'number' | 'roll' | 'damage' | 'ac_base';

/** The effects the sheet applies, in words */
const EFFECTS: { op: Op; label: string; kind: EffectKind }[] = [
  { op: 'add', label: 'Add to', kind: 'number' },
  { op: 'set', label: 'Set', kind: 'number' },
  { op: 'min', label: 'At least', kind: 'number' },
  { op: 'base', label: 'Base AC (Mage Armor)', kind: 'ac_base' },
  { op: 'adv', label: 'Advantage on', kind: 'roll' },
  { op: 'disadv', label: 'Disadvantage on', kind: 'roll' },
  { op: 'resist', label: 'Resistance to', kind: 'damage' },
  { op: 'immune', label: 'Immunity to', kind: 'damage' },
  { op: 'vuln', label: 'Vulnerability to', kind: 'damage' },
];

const { MODIFIER_TARGETS } = DndCharacterModels.Sheet;
const TARGET_LABELS = new Map(MODIFIER_TARGETS.map((t) => [t.target, t.label]));

/** Rolls that take advantage: saves, skills, initiative, attacks */
const ROLL_TARGETS = MODIFIER_TARGETS.filter((t) => /^(save|skill|attack)\.|^initiative$/.test(t.target));

/** Resistances aren't on a number; the API still wants a target */
const DEFENSE_TARGET = 'defense';

/** A modifier in words: "+1 Armor Class", "Advantage on Stealth", "Resistance to Fire" */
const describe = (m: Modifier): string => {
  const target = TARGET_LABELS.get(m.target) ?? m.target;
  const n = typeof m.value === 'number' ? m.value : null;
  switch (m.op) {
    case 'add':
      return n === null ? `${target}: ${JSON.stringify(m.value)}` : `${signed(n)} ${target}`;
    case 'set':
      return `${target} set to ${n ?? JSON.stringify(m.value)}`;
    case 'min':
      return `${target} at least ${n ?? JSON.stringify(m.value)}`;
    case 'base': {
      const base = (m.value ?? {}) as { value?: number; add_dex?: boolean };
      return n !== null ? `Base AC ${n}` : `Base AC ${base.value ?? '?'}${base.add_dex ? ' + Dex' : ''}`;
    }
    case 'adv':
      return `Advantage on ${target}`;
    case 'disadv':
      return `Disadvantage on ${target}`;
    case 'resist':
      return `Resistance to ${codeLabel(String(m.value))}`;
    case 'immune':
      return `Immunity to ${codeLabel(String(m.value))}`;
    case 'vuln':
      return `Vulnerability to ${codeLabel(String(m.value))}`;
    default:
      return `${m.op} ${target} ${JSON.stringify(m.value)}`;
  }
};

/**
 * Boons and banes: the DM's +1 AC, a curse, Mage Armor. Each can be switched off and on, or
 * removed; the form adds one (owner and editors; DMs give theirs from the campaign page). Each write
 * sends the version shown (If-Match); `changed` asks the page to reload.
 */
@Component({
  selector: 'lib-dnd-modifiers',
  imports: [
    CodeLabelPipe,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    SharedFormsSingleSelectComponent,
  ],
  templateUrl: './modifiers.component.html',
  styleUrl: './modifiers.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DndModifiersComponent {
  private readonly api = inject(DndCharacterApiService);

  readonly character = input.required<Character>();

  readonly changed = output<void>();

  protected readonly effects = EFFECTS;

  protected readonly damageTypes = DndCharacterModels.Build.DAMAGE_TYPES;

  protected readonly describe = describe;

  protected readonly saving = signal(false);

  protected readonly error = signal<string | null>(null);

  /** The owner and editors (an API without `viewer` predates sharing: the caller owns it) */
  protected readonly canEdit = computed(() => this.character().viewer?.can_edit ?? true);

  /** A campaign DM's boon or bane is that campaign's DMs' to change; the rest are the player's */
  protected mayChange(m: Modifier): boolean {
    const c = this.character();
    return m.campaign_id ? !!c.viewer?.can_give && m.campaign_id === c.campaign_id : this.canEdit();
  }

  /** A campaign DM's boon or bane counts only while the character is in that campaign */
  protected outOfCampaign(m: Modifier): boolean {
    return !!m.campaign_id && m.campaign_id !== this.character().campaign_id;
  }

  // --- the add form ---

  protected readonly label = signal('');

  protected readonly op = signal<Op>('add');

  protected readonly target = signal<string | null>(null);

  protected readonly amount = signal(1);

  protected readonly damage = signal<string | null>(null);

  protected readonly addDex = signal(true);

  protected readonly fromLevel = signal<number | null>(null);

  protected readonly kind = computed(() => EFFECTS.find((e) => e.op === this.op())?.kind ?? 'number');

  protected readonly targets = computed(() => (this.kind() === 'roll' ? ROLL_TARGETS : MODIFIER_TARGETS));

  protected readonly canAdd = computed(() => {
    if (!this.label().trim() || this.saving()) return false;
    switch (this.kind()) {
      case 'number':
        return !!this.target() && Number.isInteger(this.amount());
      case 'roll':
        return !!this.target();
      case 'damage':
        return !!this.damage();
      case 'ac_base':
        return Number.isInteger(this.amount());
    }
  });

  onOp(op: Op): void {
    this.op.set(op);
    // a target that isn't a roll can't take advantage
    if (this.kind() === 'roll' && !ROLL_TARGETS.some((t) => t.target === this.target())) this.target.set(null);
    if (this.kind() === 'ac_base' && this.amount() < 10) this.amount.set(13);
  }

  onFromLevel(value: number): void {
    this.fromLevel.set(Number.isInteger(value) && value >= 1 && value <= 20 ? value : null);
  }

  onAdd(): void {
    if (!this.canAdd()) return;
    const body: DndCharacterModels.Characters.CharacterModifierCreate = {
      label: this.label().trim(),
      op: this.op(),
      from_level: this.fromLevel(),
      ...this.effect(),
    };
    this.run(
      (c) => this.api.addModifier(c.id, body, c.version),
      () => this.resetForm(),
    );
  }

  onActive(m: Modifier, active: boolean): void {
    this.run((c) => this.api.updateModifier(c.id, m.id, { active }, c.version));
  }

  onRemove(m: Modifier): void {
    this.run((c) => this.api.deleteModifier(c.id, m.id, c.version));
  }

  private effect(): { target: string; value: unknown } {
    switch (this.kind()) {
      case 'roll':
        return { target: this.target() ?? '', value: true };
      case 'damage':
        return { target: DEFENSE_TARGET, value: this.damage() };
      case 'ac_base':
        return { target: 'ac', value: { value: this.amount(), add_dex: this.addDex() } };
      default:
        return { target: this.target() ?? '', value: this.amount() };
    }
  }

  private resetForm(): void {
    this.label.set('');
    this.amount.set(1);
    this.damage.set(null);
    this.fromLevel.set(null);
  }

  private run(write: (c: Character) => Observable<Character>, done?: () => void): void {
    this.saving.set(true);
    this.error.set(null);
    write(this.character()).subscribe({
      next: () => {
        this.saving.set(false);
        done?.();
        this.changed.emit();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.error.set(getErrorMessage(error));
        this.changed.emit();
      },
    });
  }
}
