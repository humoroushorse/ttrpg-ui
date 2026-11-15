import { ComponentFixture, TestBed } from '@angular/core/testing';
import { resourceFromSnapshots } from '@angular/core';
import { provideRouter } from '@angular/router';
import { SHARED_CORE_SERVICE_CONFIG_TOKEN } from '@ttrpg-ui/shared/core/models';
import { PageDndSpellsViewComponent } from './page-dnd-spells-view.component';

describe('PageDndSpellsViewComponent', () => {
  let component: PageDndSpellsViewComponent;
  let fixture: ComponentFixture<PageDndSpellsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageDndSpellsViewComponent],
      providers: [provideRouter([]), { provide: SHARED_CORE_SERVICE_CONFIG_TOKEN, useValue: { appTitle: 'Test' } }],
    }).compileComponents();

    fixture = TestBed.createComponent(PageDndSpellsViewComponent);
    component = fixture.componentInstance;
    const idle = () => resourceFromSnapshots(() => ({ status: 'idle' as const, value: undefined }));
    fixture.componentRef.setInput('spell', idle());
    fixture.componentRef.setInput('versions', idle());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
