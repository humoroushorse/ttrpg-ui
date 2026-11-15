import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** The campaigns pages' outlet */
@Component({
  selector: 'lib-dnd-campaigns-shell',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // passes the app's page height down, so a page can fill it
  host: { class: 'flex grow flex-col' },
})
export class DndCampaignsShellComponent {}
