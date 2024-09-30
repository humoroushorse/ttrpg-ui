import { ViewContainerRef } from '@angular/core';
import { SharedTableDynamicHostDirective } from './shared-table-dynamic-host.directive';

describe('SharedTableDynamicHostDirective', () => {
  it('should create an instance', () => {
    const directive = new SharedTableDynamicHostDirective({} as ViewContainerRef);
    expect(directive).toBeTruthy();
  });
});
