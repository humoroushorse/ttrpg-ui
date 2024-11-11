import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameSessionCardComponent } from '@ttrpg-ui/features/event-planning/ui';
import { ActivatedRoute } from '@angular/router';
import { EventPlanningGameSessionStore } from '@ttrpg-ui/features/event-planning/data-access';
import { map, Observable, tap } from 'rxjs';
import { Meta, Title } from '@angular/platform-browser';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { toSignal } from '@angular/core/rxjs-interop';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';

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

  readonly eventPlanningGameSessionStore = inject(EventPlanningGameSessionStore);

  readonly meta = inject(Meta);

  readonly title = inject(Title);

  readonly sharedCoreService = inject(SharedCoreService);

  ngOnInit(): void {
    this.title.setTitle(`Event Planning | View Game Event | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({ name: 'description', content: 'View a single game event.' });
  }

  routeId$: Observable<string | null> = this.route.params.pipe(
    map((params) => params['id'] || null),
    tap((id: string | null) => {
      this.eventPlanningGameSessionStore.get(id);
    }),
  );

  routeId = toSignal<string | null>(this.routeId$, { initialValue: null });

  entity = computed(() => {
    const selectedEntity = this.eventPlanningGameSessionStore.selected();
    if (selectedEntity?.id === this.routeId()) {
      return selectedEntity;
    }
    return null;
  });

  loading = this.eventPlanningGameSessionStore.loading;

  onJoinGameSessionClicked(event: EventPlanningModels.GameSession.GameSessionSchema) {
    this.eventPlanningGameSessionStore.joinSession(event);
  }

  onLeaveGameSessionClicked(event: EventPlanningModels.GameSession.GameSessionSchema) {
    this.eventPlanningGameSessionStore.leaveSession(event);
  }
}
