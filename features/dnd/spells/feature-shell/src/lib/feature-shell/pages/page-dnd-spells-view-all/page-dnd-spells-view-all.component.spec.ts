import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageDndSpellsViewAllComponent } from './page-dnd-spells-view-all.component';

describe('PageDndSpellsViewAllComponent', () => {
  let component: PageDndSpellsViewAllComponent;
  let fixture: ComponentFixture<PageDndSpellsViewAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageDndSpellsViewAllComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageDndSpellsViewAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
