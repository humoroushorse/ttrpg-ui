import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TagChipComponent } from './tag-chip.component';

describe('TagChipComponent', () => {
  let component: TagChipComponent;
  let fixture: ComponentFixture<TagChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagChipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TagChipComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('tag', 'test-tag');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the tag text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('test-tag');
  });

  it('should emit removed event when remove button is clicked', () => {
    let emittedTag: string | undefined;
    component.removed.subscribe((tag) => {
      emittedTag = tag;
    });

    fixture.componentRef.setInput('removable', true);
    fixture.detectChanges();

    const removeButton = fixture.nativeElement.querySelector('button[matChipRemove]') as HTMLButtonElement;
    expect(removeButton).toBeTruthy();

    removeButton.click();
    expect(emittedTag).toBe('test-tag');
  });

  it('should not show remove button when removable is false', () => {
    fixture.componentRef.setInput('removable', false);
    fixture.detectChanges();

    const removeButton = fixture.nativeElement.querySelector('button[matChipRemove]');
    expect(removeButton).toBeFalsy();
  });
});
