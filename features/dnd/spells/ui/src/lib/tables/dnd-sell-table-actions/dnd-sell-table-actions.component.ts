import { Component, inject, input } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SpellsStore } from '@ttrpg-ui/features/dnd/spells/data-access';
import { DndSpellModels } from '@ttrpg-ui/features/dnd/spells/models';

@Component({
  selector: 'lib-dnd-sell-table-actions.component',
  imports: [RouterModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
  templateUrl: './dnd-sell-table-actions.component.html',
  styleUrl: './dnd-sell-table-actions.component.scss',
})
export class DndSpellTableActionsComponent {
  public readonly authService = inject(AuthService);

  private readonly dataStore = inject(SpellsStore);

  public readonly data = input<DndSpellModels.Spells.SpellSchema>();

  onDeleteClicked(data: DndSpellModels.Spells.SpellSchema) {
    this.dataStore.delete(data);
  }
}
