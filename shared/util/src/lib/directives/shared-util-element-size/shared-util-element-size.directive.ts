import { Directive, ElementRef, inject, OnDestroy, OnInit, output } from '@angular/core';

@Directive({
  selector: '[libSharedUtilElementSize]',
  standalone: true,
})
export class SharedUtilElementSizeDirective implements OnInit, OnDestroy {
  readonly elementRef = inject(ElementRef);

  sizeChange = output<{ width: number; height: number }>();

  private observer: ResizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0];
    this.sizeChange.emit({ width: entry.contentRect.width, height: entry.contentRect.height });
  });

  ngOnInit() {
    this.observer.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy() {
    this.observer.disconnect();
  }
}
