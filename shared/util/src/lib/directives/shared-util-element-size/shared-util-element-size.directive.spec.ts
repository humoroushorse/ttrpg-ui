import { TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { SharedUtilElementSizeDirective } from './shared-util-element-size.directive';

describe('SharedUtilElementSizeDirective', () => {
  let elementRefMock: ElementRef;
  let resizeObserverCallback: (entries: ResizeObserverEntry[]) => void;

  // Mock ResizeObserver
  class MockResizeObserver {
    constructor(callback: (entries: ResizeObserverEntry[]) => void) {
      resizeObserverCallback = callback;
    }
    observe() {
      /* empty */
    }
    unobserve() {
      /* empty */
    }
    disconnect() {
      /* empty */
    }
  }

  beforeEach(() => {
    // Replace ResizeObserver with the mock
    global.ResizeObserver = MockResizeObserver as any;

    elementRefMock = new ElementRef(document.createElement('div'));

    TestBed.configureTestingModule({
      providers: [SharedUtilElementSizeDirective, { provide: ElementRef, useValue: elementRefMock }],
    });
  });

  it('should create an instance', () => {
    const directive = TestBed.inject(SharedUtilElementSizeDirective);
    expect(directive).toBeTruthy();
  });

  it('should observe the element on initialization', () => {
    const directive = TestBed.inject(SharedUtilElementSizeDirective);
    const observeSpy = jest.spyOn(MockResizeObserver.prototype, 'observe');

    directive.ngOnInit();

    expect(observeSpy).toHaveBeenCalledWith(elementRefMock.nativeElement);
  });

  it('should disconnect the observer on destruction', () => {
    const directive = TestBed.inject(SharedUtilElementSizeDirective);
    const disconnectSpy = jest.spyOn(MockResizeObserver.prototype, 'disconnect');

    directive.ngOnDestroy();

    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('should emit sizeChange when ResizeObserver callback is triggered', () => {
    const directive = TestBed.inject(SharedUtilElementSizeDirective);
    const emitSpy = jest.spyOn(directive.sizeChange, 'emit');

    const mockEntry = {
      contentRect: { width: 100, height: 200 },
    } as ResizeObserverEntry;

    resizeObserverCallback([mockEntry]);

    expect(emitSpy).toHaveBeenCalledWith({ width: 100, height: 200 });
  });
});
