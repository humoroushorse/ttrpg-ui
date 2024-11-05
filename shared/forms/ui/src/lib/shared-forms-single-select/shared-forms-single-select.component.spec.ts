import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedFormsSingleSelectComponent } from './shared-forms-single-select.component';

describe('SharedFormsSingleSelectComponent', () => {
  let component: SharedFormsSingleSelectComponent;
  let fixture: ComponentFixture<SharedFormsSingleSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedFormsSingleSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedFormsSingleSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
