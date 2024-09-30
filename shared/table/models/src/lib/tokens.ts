import { InjectionToken, ViewContainerRef } from '@angular/core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SHARED_TABLE_DATA = new InjectionToken<any>('SHARED_TABLE_DATA');
export const SHARED_TABLE_VIEW_CONTAINER_REF = new InjectionToken<ViewContainerRef>('SHARED_TABLE_VIEW_CONTAINER_REF');
