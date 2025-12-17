import { Directive, inject, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[libSharedTableDynamicHost]',
  exportAs: 'libSharedTableDynamicHost',
  standalone: true,
})
export class SharedTableDynamicHostDirective {
  public readonly viewContainerRef = inject(ViewContainerRef);
}
