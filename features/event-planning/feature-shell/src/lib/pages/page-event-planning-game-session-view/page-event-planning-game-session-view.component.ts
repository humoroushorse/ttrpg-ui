import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameSessionCardComponent } from '@ttrpg-ui/features/event-planning/ui';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { ActivatedRoute } from '@angular/router';
import { EventPlanningApiService } from '@ttrpg-ui/features/event-planning/data-access';
import { map, Observable, of, switchMap } from 'rxjs';
import { Meta, Title } from '@angular/platform-browser';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';

@Component({
  selector: 'lib-page-event-planning-game-session-view',
  standalone: true,
  imports: [CommonModule, GameSessionCardComponent],
  templateUrl: './page-event-planning-game-session-view.component.html',
  styleUrl: './page-event-planning-game-session-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageEventPlanningGameSessionViewComponent implements OnInit {
  readonly route = inject(ActivatedRoute);

  readonly eventPlanningApiService = inject(EventPlanningApiService);

  readonly meta = inject(Meta);

  readonly title = inject(Title);

  readonly sharedCoreService = inject(SharedCoreService);

  ngOnInit(): void {
    this.title.setTitle(`Event Planning | View Game Event | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({ name: 'description', content: 'View a single game event.' });
  }

  routeId$: Observable<string | null> = this.route.params.pipe(map((params) => params['id'] || null));

  entity$: Observable<EventPlanningModels.GameSession.GameSessionSchema | null> = this.routeId$.pipe(
    switchMap(() => {
      // return this.eventPlanningApiService.getGameSessionById(id);
      return of(null);
    }),
  );
}
