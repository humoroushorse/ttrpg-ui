import { Component, effect, inject, OnInit, signal, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedAngularMaterialTableComponent } from '@ttrpg-ui/shared/table/ui';
import { TableModels } from '@ttrpg-ui/shared/table/models';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { MatCardModule } from '@angular/material/card';
import { EventPlanningApiService, EventPlanningGameSessionStore } from '@ttrpg-ui/features/event-planning/data-access';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  EventPlanningGameSessionTableActionsComponent,
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
import { AuthService } from '@ttrpg-ui/features/auth/data-access';
import { UserAvatarListComponent } from '@ttrpg-ui/features/user/ui';

@Component({
  selector: 'lib-page-event-planning-game-session-view-all',
  imports: [
    CommonModule,
    SharedAngularMaterialTableComponent,
    GameSessionCardListComponent,
    UserAvatarListComponent, // used dynamically in columnDefs as a table cell component // used dynamically in columnDefs as a table cell component
    MatCardModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './page-event-planning-game-session-view-all.component.html',
  styleUrl: './page-event-planning-game-session-view-all.component.scss',
})
export class PageEventPlanningGameSessionViewAllComponent implements OnInit {
  private readonly dialog = inject(MatDialog);

  private readonly router = inject(Router);

  private readonly meta = inject(Meta);

  private readonly title = inject(Title);

  private readonly sharedCoreService = inject(SharedCoreService);

  private readonly sharedLocalStorageService = inject(SharedLocalStorageService);

  private readonly eventPlanningApiService = inject(EventPlanningApiService);

  public readonly eventPlanningGameSessionStore = inject(EventPlanningGameSessionStore);

  public readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.title.setTitle(`Event Planning | View List of Game Events | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({ name: 'description', content: 'View a list of game events.' });
  }

  public currentView = signal<'card:list' | 'card:gallery' | 'table'>(
    this.sharedLocalStorageService.get<'card:list' | 'card:gallery' | 'table'>(
      'PageEventPlanningGameSessionViewAllComponent.currentView',
    ) || 'card:list',
  );

  constructor() {
    effect(() => {
      this.sharedLocalStorageService.set(
        'PageEventPlanningGameSessionViewAllComponent.currentView',
        this.currentView(),
      );
    });
  }

  public baseUrl = this.eventPlanningApiService.serviceConfig.appConfig().APP_TTRPG_EVENT_PLANNING__API_BASE_PATH;

  private defaultColumnDefs: TableModels.ColumnDef<EventPlanningModels.GameSession.GameSessionSchema>[] = [
    { field: 'id', headerName: 'ID', cellDataType: 'text', sortable: true, pinned: 'left', hide: true },
    { field: 'game_system_id', headerName: 'Game System ID', cellDataType: 'text', sortable: true, hide: true },
    { field: 'game_master_id', headerName: 'Game Master ID', cellDataType: 'text', sortable: true },
    {
      field: 'jt_user_game_session',
      headerName: 'Players',
      cellDataType: 'component',
      valueGetter: (value: EventPlanningModels.GameSession.GameSessionSchema) => {
        return {
          users: value.jt_user_game_session?.map((v) => v.user) || [],
          emptyListText: 'No users in this session yet!',
          userCap: 4,
        };
      },
      component: UserAvatarListComponent,
    },
    { field: 'title', headerName: 'Title', cellDataType: 'text', sortable: true },
    { field: 'description', headerName: 'Description', cellDataType: 'text', sortable: false },
    { field: 'start_date', headerName: 'Start Date', cellDataType: 'date', sortable: true },
    { field: 'end_date', headerName: 'End Date', cellDataType: 'date', sortable: true },
    { field: 'max_players', headerName: 'Game System ID', cellDataType: 'number', sortable: true },
    { field: 'image_url', headerName: 'Image URL', cellDataType: 'text', sortable: true, hide: true },
    { field: 'is_public', headerName: 'Is Public', cellDataType: 'boolean', sortable: true },
    {
      field: 'actions',
      headerName: 'Actions',
      cellDataType: 'component',
      component: EventPlanningGameSessionTableActionsComponent,
      sortable: false,
      appHideColumnSettingsMenu: true,
      pinned: 'right',
    },
  ];

  columnDefs: TableModels.ColumnDef<EventPlanningModels.GameSession.GameSessionSchema>[] = this.getColumnDefs();

  private getColumnDefs(): TableModels.ColumnDef<EventPlanningModels.GameSession.GameSessionSchema>[] {
    const storedColumnDefs: TableModels.ColumnDef<EventPlanningModels.GameSession.GameSessionSchema>[] | null =
      this.sharedLocalStorageService.get('PageEventPlanningGameSessionViewAllComponent.columnDefs');
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

  onColumnDefsChange(columnDefs: TableModels.ColumnDef<EventPlanningModels.GameSession.GameSessionSchema>[]) {
    this.sharedLocalStorageService.set('PageEventPlanningGameSessionViewAllComponent.columnDefs', columnDefs);
  }

  onResetColumnDefsClicked() {
    this.columnDefs = [...this.defaultColumnDefs];
    this.sharedLocalStorageService.remove('PageEventPlanningGameSessionViewAllComponent.columnDefs');
  }

  openCreateGameSessionDialog(): void {
    this.dialog.open(EventPlanningGameSessionCreateDialogComponent, {
      data: { routeOnCreate: false },
    });
  }

  onViewGameSessionClicked(event: EventPlanningModels.GameSession.GameSessionSchema) {
    this.router.navigate(['event-planning', 'game-session', event.id]);
  }

  onJoinGameSessionClicked(event: EventPlanningModels.GameSession.GameSessionSchema) {
    this.eventPlanningGameSessionStore.joinSession(event);
  }

  onLeaveGameSessionClicked(event: EventPlanningModels.GameSession.GameSessionSchema) {
    this.eventPlanningGameSessionStore.leaveSession(event);
  }
}
