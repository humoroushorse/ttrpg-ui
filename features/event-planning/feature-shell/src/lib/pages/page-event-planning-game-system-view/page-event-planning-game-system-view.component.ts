import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EventPlanningGameSystemStore } from '@ttrpg-ui/features/event-planning/data-access';
import { Meta, Title } from '@angular/platform-browser';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { map, Observable, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { GameSystemCardComponent } from '@ttrpg-ui/features/event-planning/ui';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';

@Component({
  selector: 'lib-page-event-planning-game-system-view',
  imports: [CommonModule, GameSystemCardComponent],
  templateUrl: './page-event-planning-game-system-view.component.html',
  styleUrl: './page-event-planning-game-system-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageEventPlanningGameSystemViewComponent implements OnInit {
  readonly route = inject(ActivatedRoute);

  readonly eventPlanningGameSystemStore = inject(EventPlanningGameSystemStore);

  readonly meta = inject(Meta);

  readonly title = inject(Title);

  readonly sharedCoreService = inject(SharedCoreService);

  ngOnInit(): void {
    this.title.setTitle(`Event Planning | View Game System | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({ name: 'description', content: 'View a single game system.' });
  }

  routeId$: Observable<string | null> = this.route.params.pipe(
    map((params) => params['id'] || null),
    tap((id: string | null) => {
      this.eventPlanningGameSystemStore.get(id);
    }),
  );

  routeId = toSignal<string | null>(this.routeId$, { initialValue: null });

  entity = computed(() => {
    const selectedEntity = this.eventPlanningGameSystemStore.selected();
    if (selectedEntity?.id === this.routeId()) {
      return selectedEntity;
    }
    return null;
  });

  loading = this.eventPlanningGameSystemStore.loading;

  onDeleteGameSystemClicked(event: EventPlanningModels.GameSystem.GameSystemSchema) {
    this.eventPlanningGameSystemStore.delete(event);
  }
}
