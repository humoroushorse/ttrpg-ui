import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';

import { Meta, Title } from '@angular/platform-browser';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';

@Component({
  selector: 'lib-page-event-planning-game-system-edit',
  imports: [],
  templateUrl: './page-event-planning-game-system-edit.component.html',
  styleUrl: './page-event-planning-game-system-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
