import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { EventPlanningGameSystemCreateFormComponent } from 'features/event-planning/ui/src/forms/event-planning-game-system-create-form/event-planning-game-system-create-form.component';

@Component({
  selector: 'lib-page-event-planning-game-system-create',
  standalone: true,
  imports: [CommonModule, EventPlanningGameSystemCreateFormComponent],
  templateUrl: './page-event-planning-game-system-create.component.html',
  styleUrl: './page-event-planning-game-system-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageEventPlanningGameSystemCreateComponent implements OnInit {
  readonly meta = inject(Meta);

  readonly title = inject(Title);

  readonly sharedCoreService = inject(SharedCoreService);

  ngOnInit(): void {
    this.title.setTitle(`Event Planning | Create Game System | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({ name: 'description', content: 'Create a new game system.' });
  }
}
