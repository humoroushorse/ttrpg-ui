import { Component, ChangeDetectionStrategy } from '@angular/core';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'lib-page-dnd-not-found',
  imports: [RouterModule],
  templateUrl: './page-dnd-not-found.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './page-dnd-not-found.component.scss',
})
export class PageDndNotFoundComponent {}
