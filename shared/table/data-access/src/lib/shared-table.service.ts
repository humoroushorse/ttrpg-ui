import { Injectable, signal, Signal, inject } from '@angular/core';
import { SharedLocalStorageService } from '@ttrpg-ui/shared/local-storage/data-access';

@Injectable({
  providedIn: 'root',
})
export class SharedTableService {
  private sharedLocalStorageService = inject(SharedLocalStorageService);

  private pageSizeOptions$$ = signal<number[]>([10, 25, 100]);

  public selectedPageSize$$ = signal<number>(this.getSelectedPageSize());

  public showFirstLastButtons$$ = signal<boolean>(true);

  getPageSizeOptions(): Signal<number[]> {
    return this.pageSizeOptions$$.asReadonly();
  }

  public setSelectedPageSize(pageSize: number) {
    this.selectedPageSize$$.set(pageSize);
    this.sharedLocalStorageService.set<number>('SharedTableService.selectedPageSize$$', pageSize);
  }

  private getSelectedPageSize(): number {
    const storagePageSize = this.sharedLocalStorageService.get<number>('SharedTableService.selectedPageSize$$');
    return storagePageSize ?? this.pageSizeOptions$$()[0];
  }
}
