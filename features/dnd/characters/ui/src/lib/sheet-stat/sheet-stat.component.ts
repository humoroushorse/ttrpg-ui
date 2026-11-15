import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DndCharacterModels } from '@ttrpg-ui/features/dnd/characters/models';
import { breakdownText, signed } from '../breakdown';

/**
 * A sheet number with its breakdown on hover or focus: where every part of it comes from, what
 * doesn't apply right now, and advantage or disadvantage. The breakdown is the API's
 * contributions as they are; nothing is computed here.
 */
@Component({
  selector: 'lib-dnd-sheet-stat',
  imports: [MatTooltipModule],
  template: `<span
    class="dnd-sheet-stat g-hover-hint"
    [class.dnd-sheet-stat-changed]="changed()"
    tabindex="0"
    [matTooltip]="tooltip()"
    matTooltipClass="dnd-sheet-breakdown"
    [attr.aria-label]="tooltip()"
    >{{ text() }}
    @if (stat().roll === 'advantage') {
      <sup aria-hidden="true">A</sup>
    } @else if (stat().roll === 'disadvantage') {
      <sup aria-hidden="true">D</sup>
    }
  </span>`,
  // the tooltip renders in the overlay container, outside this component's view
  styleUrl: './sheet-stat.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DndSheetStatComponent {
  readonly stat = input.required<DndCharacterModels.Sheet.Stat>();

  /** The first line of the breakdown: "Persuasion", "Armor Class" */
  readonly label = input.required<string>();

  /** Shows +3 instead of 3 (skills, saves, modifiers) */
  readonly bonus = input(false);

  /** Marks a number that differs from another sheet (a preview) */
  readonly changed = input(false);

  protected readonly text = computed(() => (this.bonus() ? signed(this.stat().value) : `${this.stat().value}`));

  protected readonly tooltip = computed(() => breakdownText(this.label(), this.stat(), this.bonus()));
}
