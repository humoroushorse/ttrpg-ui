import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { SharedFormsSingleSelectComponent } from './shared-forms-single-select.component';

describe('SharedFormsSingleSelectComponent', () => {
  let component: SharedFormsSingleSelectComponent;
  let fixture: ComponentFixture<SharedFormsSingleSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedFormsSingleSelectComponent],
      providers: [
        {
          provide: NgControl,
          useValue: {
            control: { value: null },
            errors: null,
            touched: false,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedFormsSingleSelectComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
