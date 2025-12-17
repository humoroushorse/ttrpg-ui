import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageDndSpellsViewComponent } from './page-dnd-spells-view.component';

describe('PageDndSpellsViewComponent', () => {
  let component: PageDndSpellsViewComponent;
  let fixture: ComponentFixture<PageDndSpellsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageDndSpellsViewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageDndSpellsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
