import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SharedTableService } from '@ttrpg-ui/shared/table/data-access';
import { PaginatedStore, SharedPaginatorComponent } from './shared-paginator.component';

describe('SharedPaginatorComponent', () => {
  function setup() {
    const store: PaginatedStore = {
      pagination: signal({ currentPage: 1, pageSize: 10, totalItems: 95, totalPages: 10 }),
      loading: signal(false),
      setPage: vi.fn(),
      setPageSize: vi.fn(),
    };
    const tableService = {
      getPageSizeOptions: () => signal([10, 25]),
      showFirstLastButtons: signal(true),
      setSelectedPageSize: vi.fn(),
    };
    TestBed.configureTestingModule({ providers: [{ provide: SharedTableService, useValue: tableService }] });
    const fixture = TestBed.createComponent(SharedPaginatorComponent);
    fixture.componentRef.setInput('store', store);
    fixture.detectChanges();
    return { component: fixture.componentInstance, store, tableService, fixture };
  }

  it('renders the store page', () => {
    const { fixture } = setup();
    expect(fixture.nativeElement.textContent).toContain('1 – 10 of 95');
  });

  it('sends page changes as 1-based pages', () => {
    const { component, store } = setup();
    component.onPage({ pageIndex: 2, pageSize: 10, length: 95 });
    expect(store.setPage).toHaveBeenCalledWith(3);
    expect(store.setPageSize).not.toHaveBeenCalled();
  });

  it('saves and applies page size changes', () => {
    const { component, store, tableService } = setup();
    component.onPage({ pageIndex: 0, pageSize: 25, length: 95 });
    expect(store.setPageSize).toHaveBeenCalledWith(25);
    expect(tableService.setSelectedPageSize).toHaveBeenCalledWith(25);
    expect(store.setPage).not.toHaveBeenCalled();
  });
});
