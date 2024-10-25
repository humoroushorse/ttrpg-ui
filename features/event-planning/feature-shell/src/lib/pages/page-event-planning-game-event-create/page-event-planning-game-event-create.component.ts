import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { EventPlanningGameSessionCreateFormComponent } from 'features/event-planning/ui/src/forms/event-planning-game-session-create-form.component';

@Component({
  selector: 'lib-page-event-planning-game-event-create',
  standalone: true,
  imports: [CommonModule, EventPlanningGameSessionCreateFormComponent],
  templateUrl: './page-event-planning-game-event-create.component.html',
  styleUrl: './page-event-planning-game-event-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageEventPlanningGameEventCreateComponent implements OnInit {
  readonly meta = inject(Meta);

  readonly title = inject(Title);

  readonly sharedCoreService = inject(SharedCoreService);

  ngOnInit(): void {
    this.title.setTitle(`Event Planning | Create Game Event | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({ name: 'description', content: 'Create a new game event.' });
  }
}
