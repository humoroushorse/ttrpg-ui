import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageDndSpellsEditComponent } from './page-dnd-spells-edit.component';

describe('PageDndSpellsEditComponent', () => {
  let component: PageDndSpellsEditComponent;
  let fixture: ComponentFixture<PageDndSpellsEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageDndSpellsEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageDndSpellsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
