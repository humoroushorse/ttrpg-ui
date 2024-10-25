import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedTableComponent } from '@ttrpg-ui/shared/table/ui';
import { TableModels } from '@ttrpg-ui/shared/table/models';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { MatCardModule } from '@angular/material/card';
import { EventPlanningApiService } from '@ttrpg-ui/features/event-planning/data-access';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  EventPlanningGameSessionCreateDialogComponent,
  GameSessionCardListComponent,
} from '@ttrpg-ui/features/event-planning/ui';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';

@Component({
  selector: 'lib-page-event-planning-game-event-view-all',
  standalone: true,
  imports: [
    CommonModule,
    SharedTableComponent,
    GameSessionCardListComponent,
    MatCardModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './page-event-planning-game-event-view-all.component.html',
  styleUrl: './page-event-planning-game-event-view-all.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageEventPlanningGameEventViewAllComponent implements OnInit {
  readonly dialog = inject(MatDialog);

  readonly router = inject(Router);

  readonly meta = inject(Meta);

  readonly title = inject(Title);

  readonly sharedCoreService = inject(SharedCoreService);

  readonly sharedLocalStorageService = inject(SharedLocalStorageService);

  ngOnInit(): void {
    this.title.setTitle(`Event Planning | View List of Game Events | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({ name: 'description', content: 'View a list of game events.' });
  }

  public currentView = signal<'card:list' | 'card:gallery' | 'table'>(
    this.sharedLocalStorageService.get<'card:list' | 'card:gallery' | 'table'>(
      'PageEventPlanningGameEventViewAllComponent.currentView',
    ) || 'card:gallery',
  );

  constructor() {
    effect(() => {
      this.sharedLocalStorageService.set('PageEventPlanningGameEventViewAllComponent.currentView', this.currentView());
    });
  }

  private eventPlanningApiService = inject(EventPlanningApiService);

  public baseUrl = this.eventPlanningApiService.serviceConfig.APP_TTRPG_EVENT_PLANNING__API_BASE_PATH;

  data$ = this.eventPlanningApiService.getGameSessions();

  private defaultColumnDefs: TableModels.ColumnDef[] = [
    { field: 'id', headerName: 'ID', cellDataType: 'text', sortable: true, pinned: 'left', hide: true },
    { field: 'game_system_id', headerName: 'Game System ID', cellDataType: 'text', sortable: true, hide: true },
    { field: 'game_master_id', headerName: 'Game Master ID', cellDataType: 'text', sortable: true },
    { field: 'title', headerName: 'Title', cellDataType: 'text', sortable: true },
    { field: 'description', headerName: 'Description', cellDataType: 'text', sortable: false },
    { field: 'start_date', headerName: 'Start Date', cellDataType: 'date', sortable: true },
    { field: 'end_date', headerName: 'End Date', cellDataType: 'date', sortable: true },
    { field: 'max_players', headerName: 'Game System ID', cellDataType: 'number', sortable: true },
    { field: 'image_url', headerName: 'Image URL', cellDataType: 'text', sortable: true, hide: true },
    { field: 'is_public', headerName: 'Is Public', cellDataType: 'boolean', sortable: true },
  ];

  columnDefs: TableModels.ColumnDef[] = this.getColumnDefs();

  private getColumnDefs(): TableModels.ColumnDef[] {
    const storedColumnDefs: TableModels.ColumnDef[] | null = this.sharedLocalStorageService.get(
      'PageEventPlanningGameEventViewAllComponent.columnDefs',
    );
    if (storedColumnDefs) {
      return storedColumnDefs.map((c) => {
        if (c.cellDataType === 'component') {
          return {
            ...c,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            component: this.defaultColumnDefs.find((d) => d.field === c.field)?.component as Type<any>,
          };
        }
        return c;
      });
    }
    return [...this.defaultColumnDefs];
  }

  onColumnDefsChange(columnDefs: TableModels.ColumnDef[]) {
    this.sharedLocalStorageService.set('PageEventPlanningGameEventViewAllComponent.columnDefs', columnDefs);
  }

  onResetColumnDefsClicked() {
    this.columnDefs = [...this.defaultColumnDefs];
    this.sharedLocalStorageService.remove('PageEventPlanningGameEventViewAllComponent.columnDefs');
  }

  openCreateGameEventDialog(): void {
    this.dialog.open(EventPlanningGameSessionCreateDialogComponent, {});
  }

  onViewGameSessionClicked(event: EventPlanningModels.Schemas.GameSessionSchema) {
    this.router.navigate(['event-planning', 'game-event', event.id]);
  }
}
