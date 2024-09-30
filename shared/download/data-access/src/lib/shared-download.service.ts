import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedDownloadService {
  // TODO: support yml, xml, xlsx, md, avro, txt

  downloadFileJson<T>(data: T[], filename = 'data'): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    this.downloadFile(blob, filename, '.json');
  }

  downloadFileCsv<T>(data: T[], fields: string[], filename = 'data'): void {
    const csvData: string = this.convertToCsv<T>(data, fields);
    const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    this.downloadFile(blob, filename, '.csv');
  }

  private downloadFile(blob: Blob, filename: string, extension: string): void {
    const downloadLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) {
      // if Safari open in new window to save file with random filename.
      downloadLink.setAttribute('target', '_blank');
    }
    downloadLink.setAttribute('href', url);
    downloadLink.setAttribute('download', filename + extension);
    downloadLink.style.visibility = 'hidden';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  private convertToCsv<T>(data: T[], headers: string[], indexColumn?: string): string {
    console.log(data, headers, indexColumn);
    const array = typeof data !== 'object' ? JSON.parse(data) : data;
    let fileContents = '';
    const row = `${indexColumn ? indexColumn + ',' : ''}${headers.join(',')}`;
    fileContents += row + '\r\n';
    array.forEach((datum: T, i: number) => {
      let line = indexColumn ? `${i + 1}` : '';
      headers.forEach((header: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        line = `${line ? line + ',' : line}${(<any>datum)[header]}`;
      });
      fileContents += line + '\r\n';
    });
    return fileContents;
  }
}
