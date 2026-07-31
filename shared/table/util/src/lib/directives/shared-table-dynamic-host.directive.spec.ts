import { TestBed } from '@angular/core/testing';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SharedTableDynamicHostDirective } from './shared-table-dynamic-host.directive';

@Component({
  template: '<div libSharedTableDynamicHost></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SharedTableDynamicHostDirective],
})
class TestComponent {}

describe('SharedTableDynamicHostDirective', () => {
  it('should create an instance', () => {
    TestBed.configureTestingModule({
      imports: [TestComponent],
    });
    const fixture = TestBed.createComponent(TestComponent);
    expect(fixture).toBeTruthy();
  });
});
