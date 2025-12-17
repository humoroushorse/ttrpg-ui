import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'lib-page-dnd-not-found',
  imports: [RouterModule],
  templateUrl: './page-dnd-not-found.component.html',
  styleUrl: './page-dnd-not-found.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDndNotFoundComponent {}
