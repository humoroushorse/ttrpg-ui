import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** The characters pages' outlet */
@Component({
  selector: 'lib-dnd-characters-shell',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // passes the app's page height down, so a page can fill it
  host: { class: 'flex grow flex-col' },
})
export class DndCharactersShellComponent {}
