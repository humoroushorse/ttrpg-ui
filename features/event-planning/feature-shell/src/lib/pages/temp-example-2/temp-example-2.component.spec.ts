import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TempExample2Component } from './temp-example-2.component';

describe('TempExample2Component', () => {
  let component: TempExample2Component;
  let fixture: ComponentFixture<TempExample2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TempExample2Component],
    }).compileComponents();

    fixture = TestBed.createComponent(TempExample2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
