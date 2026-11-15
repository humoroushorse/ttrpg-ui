import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** The species pages' outlet */
@Component({
  selector: 'lib-dnd-species-shell',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // passes the app's page height down, so a page can fill it
  host: { class: 'flex grow flex-col' },
})
export class DndSpeciesShellComponent {}
