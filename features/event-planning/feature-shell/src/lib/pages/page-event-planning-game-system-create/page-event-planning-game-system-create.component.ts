import { Component, inject, OnInit } from '@angular/core';

import { Meta, Title } from '@angular/platform-browser';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { EventPlanningGameSystemCreateFormComponent } from '@ttrpg-ui/features/event-planning/ui';

@Component({
  selector: 'lib-page-event-planning-game-system-create',
  imports: [EventPlanningGameSystemCreateFormComponent],
  templateUrl: './page-event-planning-game-system-create.component.html',
  styleUrl: './page-event-planning-game-system-create.component.scss',
})
export class PageEventPlanningGameSystemCreateComponent implements OnInit {
  private readonly meta = inject(Meta);

  private readonly title = inject(Title);

  private readonly sharedCoreService = inject(SharedCoreService);

  ngOnInit(): void {
    this.title.setTitle(`Event Planning | Create Game System | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({ name: 'description', content: 'Create a new game system.' });
  }
}
