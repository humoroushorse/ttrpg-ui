import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';

type Level = DndCharacterModels.Sheet.ProficiencyLevel;

const LABELS: Record<Level, string> = {
  none: 'Not proficient',
  half: 'Half proficiency',
  proficient: 'Proficient',
  expertise: 'Expertise',
};

/**
 * A proficiency mark: an empty ring, half filled (Jack of All Trades), filled, or filled with a
 * second ring (expertise). Every mark takes the same space, ring or not, so rows stay aligned.
 */
@Component({
  selector: 'lib-dnd-proficiency-mark',
  template: `<span class="mark" [attr.data-level]="level()" role="img" [attr.aria-label]="label()"></span>`,
  styleUrl: './proficiency-mark.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DndProficiencyMarkComponent {
  readonly level = input.required<Level>();

  protected readonly label = computed(() => LABELS[this.level()]);
}
