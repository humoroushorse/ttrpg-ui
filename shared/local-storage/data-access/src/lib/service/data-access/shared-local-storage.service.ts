import { inject, Injectable } from '@angular/core';

import {
  SharedLocalStorageServiceConfig,
  SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN,
} from '@ttrpg-ui/shared/local-storage/models';
@Injectable({
  providedIn: 'root',
})
export class SharedLocalStorageService {
  private config: SharedLocalStorageServiceConfig = inject(SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAll(): Record<string, any> {
    const data = localStorage.getItem(this.config.namespace);
    return data ? JSON.parse(data) : {};
  }

  get<T>(key: string): T | null {
    return (this.getAll()[key] as T) || null;
  }

  set<T>(key: string, value: T): void {
    const data = this.getAll();
    data[key] = value;
    localStorage.setItem(this.config.namespace, JSON.stringify(data));
  }

  remove(key: string): void {
    const data = this.getAll();
    delete data[key];
    localStorage.setItem(this.config.namespace, JSON.stringify(data));
  }

  clearNamespace(): void {
    localStorage.removeItem(this.config.namespace);
  }

  hasKey(key: string): boolean {
    const data = this.getAll();
    return key in data;
  }
}
