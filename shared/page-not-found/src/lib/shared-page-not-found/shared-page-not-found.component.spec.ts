import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedPageNotFoundComponent } from './shared-page-not-found.component';

describe('SharedPageNotFoundComponent', () => {
  let component: SharedPageNotFoundComponent;
  let fixture: ComponentFixture<SharedPageNotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedPageNotFoundComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedPageNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
