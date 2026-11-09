import { ChangeDetectionStrategy, Component, effect, inject, input, Signal } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { SharedTableService } from '@ttrpg-ui/shared/table/data-access';

/** What the paginator needs from a store, e.g. one built with `withPagination` */
export type PaginatedStore = {
  pagination: Signal<SharedModels.Store.PaginationState>;
  loading: Signal<boolean>;
  setPage(currentPage: number): void;
  setPageSize(pageSize: number): void;
};

@Component({
  selector: 'lib-shared-paginator',
  imports: [MatPaginatorModule],
  templateUrl: './shared-paginator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedPaginatorComponent {
  private readonly sharedTableService = inject(SharedTableService);

  private readonly liveAnnouncer = inject(LiveAnnouncer);

  private readonly intl = inject(MatPaginatorIntl);

  store = input.required<PaginatedStore>();

  pageSizeOptions = this.sharedTableService.getPageSizeOptions();

  showFirstLastButtons = this.sharedTableService.showFirstLastButtons;

  constructor() {
    // the visible range label isn't announced, so say it once each page has loaded
    effect(() => {
      if (this.store().loading()) return;
      const { currentPage, pageSize, totalItems } = this.store().pagination();
      this.liveAnnouncer.announce(this.intl.getRangeLabel(currentPage - 1, pageSize, totalItems), 'polite');
    });
  }

  onPage(event: PageEvent): void {
    if (event.pageSize !== this.store().pagination().pageSize) {
      this.sharedTableService.setSelectedPageSize(event.pageSize);
      this.store().setPageSize(event.pageSize);
    } else {
      this.store().setPage(event.pageIndex + 1);
    }
  }
}
