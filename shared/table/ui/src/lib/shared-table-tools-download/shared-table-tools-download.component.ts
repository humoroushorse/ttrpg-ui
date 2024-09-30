import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableDataSource } from '@angular/material/table';
import { SharedDownloadService } from '@ttrpg-ui/shared/download/data-access';

@Component({
  selector: 'lib-shared-table-tools-download',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './shared-table-tools-download.component.html',
  styleUrl: './shared-table-tools-download.component.scss',
})
export class SharedTableToolsDownloadComponent<T> {
  private sharedDownloadService = inject(SharedDownloadService);

  dataSource = input<MatTableDataSource<T>>();
  displayedColumns = input<string[]>([]);

  downloadJson() {
    this.sharedDownloadService.downloadFileJson(this.getFilteredData(), undefined);
  }

  downloadCsv() {
    this.sharedDownloadService.downloadFileCsv(this.getFilteredData(), this.displayedColumns(), undefined);
  }

  private getFilteredData(): T[] {
    const dataSource = this.dataSource();
    if (!dataSource) return [] as T[];
    return dataSource.sort ? dataSource.sortData(dataSource.filteredData, dataSource.sort) : dataSource.filteredData;
  }
}
