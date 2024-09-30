import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TempExampleComponent } from './temp-example.component';

describe('TempExampleComponent', () => {
  let component: TempExampleComponent;
  let fixture: ComponentFixture<TempExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TempExampleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TempExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
