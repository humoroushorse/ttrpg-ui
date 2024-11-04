import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedTableComponent } from '@ttrpg-ui/shared/table/ui';
import { TableModels } from '@ttrpg-ui/shared/table/models';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { MatCardModule } from '@angular/material/card';
import { EventPlanningApiService, EventPlanningGameSystemStore } from '@ttrpg-ui/features/event-planning/data-access';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  EventPlanningGameSystemCreateDialogComponent,
  EventPlanningGameSystemTableActionsComponent,
} from '@ttrpg-ui/features/event-planning/ui';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EventPlanningModels } from '@ttrpg-ui/features/event-planning/models';
import { Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { SharedCoreService } from '@ttrpg-ui/shared/core/data-access';
import { AuthService } from '@ttrpg-ui/features/auth/data-access';

@Component({
  selector: 'lib-page-event-planning-game-system-view-all',
  standalone: true,
  imports: [
    CommonModule,
    SharedTableComponent,
    MatCardModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './page-event-planning-game-system-view-all.component.html',
  styleUrl: './page-event-planning-game-system-view-all.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageEventPlanningGameSystemViewAllComponent implements OnInit {
  readonly dialog = inject(MatDialog);

  readonly router = inject(Router);

  readonly meta = inject(Meta);

  readonly title = inject(Title);

  readonly sharedCoreService = inject(SharedCoreService);

  readonly sharedLocalStorageService = inject(SharedLocalStorageService);

  readonly gameEventStore = inject(EventPlanningGameSystemStore);

  readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.title.setTitle(`Event Planning | View List of Game Systems | ${this.sharedCoreService.appTitle}`);
    this.meta.updateTag({ name: 'description', content: 'View a list of game systems.' });
  }

  public currentView = signal<'card' | 'table'>(
    this.sharedLocalStorageService.get<'card' | 'table'>('PageEventPlanningGameSystemViewAllComponent.currentView') ||
      'card',
  );

  constructor() {
    effect(() => {
      this.sharedLocalStorageService.set('PageEventPlanningGameSystemViewAllComponent.currentView', this.currentView());
    });
  }

  private eventPlanningApiService = inject(EventPlanningApiService);

  public baseUrl = this.eventPlanningApiService.serviceConfig.appConfig().APP_TTRPG_EVENT_PLANNING__API_BASE_PATH;

  private defaultColumnDefs: TableModels.ColumnDef[] = [
    { field: 'id', headerName: 'ID', cellDataType: 'text', sortable: true, pinned: 'left', hide: true },
    { field: 'name', headerName: 'Name', cellDataType: 'text', sortable: true },
    { field: 'version', headerName: 'Version', cellDataType: 'text', sortable: true },
    { field: 'release_year', headerName: 'Release Year', cellDataType: 'text', sortable: true },
    { field: 'description', headerName: 'Description', cellDataType: 'text', sortable: true },
    {
      field: 'actions',
      headerName: 'Actions',
      cellDataType: 'component',
      component: EventPlanningGameSystemTableActionsComponent,
      sortable: true,
      pinned: 'right',
    },
  ];

  columnDefs: TableModels.ColumnDef[] = this.getColumnDefs();

  private getColumnDefs(): TableModels.ColumnDef[] {
    const storedColumnDefs: TableModels.ColumnDef[] | null = this.sharedLocalStorageService.get(
      'PageEventPlanningGameSystemViewAllComponent.columnDefs',
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
    this.sharedLocalStorageService.set('PageEventPlanningGameSystemViewAllComponent.columnDefs', columnDefs);
  }

  onResetColumnDefsClicked() {
    this.columnDefs = [...this.defaultColumnDefs];
    this.sharedLocalStorageService.remove('PageEventPlanningGameSystemViewAllComponent.columnDefs');
  }

  openCreateGameSessionDialog(): void {
    this.dialog.open(EventPlanningGameSystemCreateDialogComponent, {
      data: { routeOnCreate: false },
    });
  }

  onViewGameSessionClicked(event: EventPlanningModels.GameSession.GameSessionSchema) {
    this.router.navigate(['event-planning', 'game-system', event.id]);
  }
}
