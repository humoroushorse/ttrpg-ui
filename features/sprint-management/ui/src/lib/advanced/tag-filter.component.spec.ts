import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TagFilterComponent } from './tag-filter.component';

describe('TagFilterComponent', () => {
  let component: TagFilterComponent;
  let fixture: ComponentFixture<TagFilterComponent>;

  const mockTags = [
    { tag: 'bug', count: 3 },
    { tag: 'feature', count: 5 },
    { tag: 'frontend', count: 2 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagFilterComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TagFilterComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('availableTags', mockTags);
    fixture.componentRef.setInput('selectedTags', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all available tags', () => {
    const chips = fixture.nativeElement.querySelectorAll('mat-chip-option');
    expect(chips.length).toBe(3);
  });

  it('should emit selectionChanged with added tag when toggling unselected tag', () => {
    let emitted: string[] | undefined;
    component.selectionChanged.subscribe((tags) => (emitted = tags));

    component.toggleTag('bug');

    expect(emitted).toEqual(['bug']);
  });

  it('should emit selectionChanged without tag when toggling selected tag', () => {
    fixture.componentRef.setInput('selectedTags', ['bug', 'feature']);
    fixture.detectChanges();

    let emitted: string[] | undefined;
    component.selectionChanged.subscribe((tags) => (emitted = tags));

    component.toggleTag('bug');

    expect(emitted).toEqual(['feature']);
  });

  it('should emit empty array when clearAll is called', () => {
    fixture.componentRef.setInput('selectedTags', ['bug', 'feature']);
    fixture.detectChanges();

    let emitted: string[] | undefined;
    component.selectionChanged.subscribe((tags) => (emitted = tags));

    component.clearAll();

    expect(emitted).toEqual([]);
  });

  it('should correctly report isSelected', () => {
    fixture.componentRef.setInput('selectedTags', ['bug']);
    fixture.detectChanges();

    expect(component.isSelected('bug')).toBe(true);
    expect(component.isSelected('feature')).toBe(false);
  });

  it('should show empty message when no tags available', () => {
    fixture.componentRef.setInput('availableTags', []);
    fixture.detectChanges();

    const empty = fixture.nativeElement.querySelector('.tag-filter__empty');
    expect(empty).toBeTruthy();
    expect(empty.textContent).toContain('No tags available');
  });

  it('should show clear button when tags are selected', () => {
    fixture.componentRef.setInput('selectedTags', ['bug']);
    fixture.detectChanges();

    const clearBtn = fixture.nativeElement.querySelector('.tag-filter__clear');
    expect(clearBtn).toBeTruthy();
  });

  it('should not show clear button when no tags are selected', () => {
    fixture.componentRef.setInput('selectedTags', []);
    fixture.detectChanges();

    const clearBtn = fixture.nativeElement.querySelector('.tag-filter__clear');
    expect(clearBtn).toBeFalsy();
  });

  it('should have accessible aria-label on container', () => {
    const container = fixture.nativeElement.querySelector('[aria-label="Filter by tags"]');
    expect(container).toBeTruthy();
  });
});
