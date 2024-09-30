import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[libSharedTableDynamicHost]',
  exportAs: 'libSharedTableDynamicHost',
  standalone: true,
})
export class SharedTableDynamicHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
