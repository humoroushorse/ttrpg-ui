import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import {
  SharedLocalStorageServiceConfig,
  SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN,
} from '@ttrpg-ui/shared/local-storage/models';

@Injectable({
  providedIn: 'root',
})
export class SharedLocalStorageService {
  private readonly config: SharedLocalStorageServiceConfig = inject(SHARED_LOCAL_STORAGE_SERVICE_CONFIG_TOKEN);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser: boolean = isPlatformBrowser(this.platformId);

  // In-memory fallback for SSR
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private memoryStorage: Record<string, any> = {};

  private getStorage(): Storage | null {
    return this.isBrowser ? localStorage : null;
  }

  private getKey(key: string): string {
    return `${this.config.namespace}.${key}`;
  }

  private getPersistentKey(key: string): string {
    return `${this.config.namespace}.persistent.${key}`;
  }

  // Utility method to get all non-persistent values in the namespace
  // Primarily used for debugging and testing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAll(): Record<string, any> {
    const storage = this.getStorage();
    const result: Record<string, any> = {};

    if (!storage) {
      return this.memoryStorage;
    }

    // Get all keys that start with our namespace (but not persistent)
    const prefix = `${this.config.namespace}.`;
    const persistentPrefix = `${this.config.namespace}.persistent.`;

    for (let i = 0; i < storage.length; i++) {
      const fullKey = storage.key(i);
      if (fullKey && fullKey.startsWith(prefix) && !fullKey.startsWith(persistentPrefix)) {
        const key = fullKey.substring(prefix.length);
        const value = storage.getItem(fullKey);
        if (value) {
          try {
            result[key] = JSON.parse(value);
          } catch {
            result[key] = value;
          }
        }
      }
    }

    return result;
  }

  get<T>(key: string): T | null {
    const storage = this.getStorage();
    const fullKey = this.getKey(key);

    if (!storage) {
      return (this.memoryStorage[fullKey] as T) || null;
    }

    const value = storage.getItem(fullKey);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  set<T>(key: string, value: T): void {
    const storage = this.getStorage();
    const fullKey = this.getKey(key);

    if (!storage) {
      this.memoryStorage[fullKey] = value;
      return;
    }

    storage.setItem(fullKey, JSON.stringify(value));
  }

  remove(key: string): void {
    const storage = this.getStorage();
    const fullKey = this.getKey(key);

    if (!storage) {
      delete this.memoryStorage[fullKey];
      return;
    }

    storage.removeItem(fullKey);
  }

  clearNamespace(): void {
    const storage = this.getStorage();

    if (!storage) {
      // Clear memory storage except persistent keys
      const persistentPrefix = `${this.config.namespace}.persistent.`;
      Object.keys(this.memoryStorage).forEach(key => {
        if (!key.startsWith(persistentPrefix)) {
          delete this.memoryStorage[key];
        }
      });
      return;
    }

    // Remove all keys with our namespace prefix (but not persistent)
    const prefix = `${this.config.namespace}.`;
    const persistentPrefix = `${this.config.namespace}.persistent.`;
    const keysToRemove: string[] = [];

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith(prefix) && !key.startsWith(persistentPrefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => storage.removeItem(key));
  }

  hasKey(key: string): boolean {
    const storage = this.getStorage();
    const fullKey = this.getKey(key);

    if (!storage) {
      return fullKey in this.memoryStorage;
    }

    return storage.getItem(fullKey) !== null;
  }

  // Persistent namespace methods - data that survives clearNamespace()
  getPersistent<T>(key: string): T | null {
    const storage = this.getStorage();
    const fullKey = this.getPersistentKey(key);

    if (!storage) {
      return (this.memoryStorage[fullKey] as T) || null;
    }

    const value = storage.getItem(fullKey);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  setPersistent<T>(key: string, value: T): void {
    const storage = this.getStorage();
    const fullKey = this.getPersistentKey(key);

    if (!storage) {
      this.memoryStorage[fullKey] = value;
      return;
    }

    storage.setItem(fullKey, JSON.stringify(value));
  }

  removePersistent(key: string): void {
    const storage = this.getStorage();
    const fullKey = this.getPersistentKey(key);

    if (!storage) {
      delete this.memoryStorage[fullKey];
      return;
    }

    storage.removeItem(fullKey);
  }
}
