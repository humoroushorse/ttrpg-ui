import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { Meta, Title } from '@angular/platform-browser';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';

@Component({
  selector: 'lib-page-event-planning-game-system-edit',
  imports: [],
  templateUrl: './page-event-planning-game-system-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './page-event-planning-game-system-edit.component.scss',
})
export class PageEventPlanningGameSystemEditComponent implements OnInit {
  private readonly meta = inject(Meta);

  private readonly title = inject(Title);

  private readonly sharedCoreService = inject(SharedCoreService);

  ngOnInit(): void {
    this.title.setTitle(`Event Planning | Edit Game System | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({ name: 'description', content: 'Edit a single game system.' });
  }
}
