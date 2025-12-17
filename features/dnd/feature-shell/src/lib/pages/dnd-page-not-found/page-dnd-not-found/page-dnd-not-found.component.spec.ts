import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageDndNotFoundComponent } from './page-dnd-not-found.component';

describe('PageDndNotFoundComponent', () => {
  let component: PageDndNotFoundComponent;
  let fixture: ComponentFixture<PageDndNotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageDndNotFoundComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageDndNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
