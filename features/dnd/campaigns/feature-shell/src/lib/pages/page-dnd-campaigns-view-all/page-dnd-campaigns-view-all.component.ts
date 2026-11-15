import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { pageMeta } from '@ttrpg-ui/shared/core/util';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';
import { SharedPaginatorComponent } from '@ttrpg-ui/shared/pagination/ui';
import { getErrorMessage } from '@ttrpg-ui/shared/store/util';
import { TableModels } from '@ttrpg-ui/shared/table/models';
import { SharedAngularMaterialTableComponent } from '@ttrpg-ui/shared/table/ui';
import { reconcileLayout, toSavedLayout } from '@ttrpg-ui/shared/table/util';
import { DndCampaignModels } from '@ttrpg-ui/features/dnd/campaigns/models';
import { DndCampaignApiService, DndCampaignsStore } from '@ttrpg-ui/features/dnd/campaigns/data-access';

type Campaign = DndCampaignModels.Campaigns.CampaignSchema;
type MyInvite = DndCampaignModels.Campaigns.MyInvite;
type Column = TableModels.ColumnDef<Campaign>;

/** Where the user's column order, widths and hidden columns are saved */
const LAYOUT_KEY = 'PageDndCampaignsViewAllComponent.columnDefs';

// the API lists campaigns by name only: no sorting or filters
const DEFAULT_COLUMN_DEFS: Column[] = [
  { field: 'id', headerName: 'ID', cellDataType: 'text', sortable: false, pinned: 'left', hide: true },
  { field: 'name', headerName: 'Name', cellDataType: 'text', sortable: false, pinned: 'left' },
  { field: 'description', headerName: 'Description', cellDataType: 'text', sortable: false },
  { field: 'updated_at', headerName: 'Updated', cellDataType: 'date', sortable: false },
];

@Component({
  selector: 'lib-page-dnd-campaigns-view-all',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    SharedAngularMaterialTableComponent,
    SharedPaginatorComponent,
  ],
  templateUrl: './page-dnd-campaigns-view-all.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // fills the page height so the table scrolls inside; 30rem floor for short screens
  host: { class: 'flex min-h-120 flex-1 flex-col gap-2' },
})
export class PageDndCampaignsViewAllComponent {
  private readonly router = inject(Router);

  private readonly localStorage = inject(SharedLocalStorageService);

  private readonly api = inject(DndCampaignApiService);

  protected readonly store = inject(DndCampaignsStore);

  protected columnDefs: Column[] = reconcileLayout(this.localStorage.get(LAYOUT_KEY), DEFAULT_COLUMN_DEFS);

  /** Invites sent to the caller by username */
  protected readonly invites = rxResource({ stream: () => this.api.getMyInvites() });

  protected readonly answering = signal(false);

  protected readonly inviteError = signal<string | null>(null);

  constructor() {
    pageMeta(() => ({ title: ['Campaigns'], description: 'A list of campaigns.' }));
  }

  onAccept(invite: MyInvite): void {
    this.answering.set(true);
    this.inviteError.set(null);
    this.api.acceptInvite(invite.id).subscribe({
      next: (campaign) => this.router.navigate(DndCampaignModels.Campaigns.campaignRoute(campaign)),
      error: (error: unknown) => {
        this.answering.set(false);
        this.inviteError.set(getErrorMessage(error));
      },
    });
  }

  onDecline(invite: MyInvite): void {
    this.answering.set(true);
    this.inviteError.set(null);
    this.api.declineInvite(invite.id).subscribe({
      next: (left) => {
        this.answering.set(false);
        this.invites.set(left);
      },
      error: (error: unknown) => {
        this.answering.set(false);
        this.inviteError.set(getErrorMessage(error));
      },
    });
  }

  onColumnDefsChange(columnDefs: Column[]): void {
    this.localStorage.set(LAYOUT_KEY, toSavedLayout(columnDefs));
  }

  onResetColumnDefsClicked(): void {
    this.columnDefs = [...DEFAULT_COLUMN_DEFS];
    this.localStorage.remove(LAYOUT_KEY);
  }

  onRowDoubleClicked(campaign: Campaign): void {
    this.router.navigate(DndCampaignModels.Campaigns.campaignRoute(campaign));
  }
}
