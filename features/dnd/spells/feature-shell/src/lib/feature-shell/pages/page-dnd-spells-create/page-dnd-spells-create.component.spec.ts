import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageDndSpellsCreateComponent } from './page-dnd-spells-create.component';

describe('PageDndSpellsCreateComponent', () => {
  let component: PageDndSpellsCreateComponent;
  let fixture: ComponentFixture<PageDndSpellsCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageDndSpellsCreateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageDndSpellsCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
