import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { SheetChange } from '../sheet-changes';

/** A list of sheet changes: "Charisma 15 → 17", "Features + Darkvision (Elf)" */
@Component({
  selector: 'lib-dnd-sheet-changes',
  templateUrl: './sheet-changes.component.html',
  styleUrl: './sheet-changes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DndSheetChangesComponent {
  readonly changes = input.required<SheetChange[]>();

  /** What to say when nothing changes */
  readonly empty = input('No change to the sheet.');
}
