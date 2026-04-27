import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, delay } from 'rxjs';
import { SharedFormsSingleSelectAutocompleteComponent } from './shared-forms-single-select-autocomplete.component';

describe('SharedFormsSingleSelectAutocompleteComponent', () => {
  let component: SharedFormsSingleSelectAutocompleteComponent;
  let fixture: ComponentFixture<SharedFormsSingleSelectAutocompleteComponent>;

  const mockOptions = [
    { id: '1', name: 'Option 1' },
    { id: '2', name: 'Option 2' },
    { id: '3', name: 'Option 3' },
  ];

  const mockSearchFn = (query: string) => {
    const filtered = mockOptions.filter((opt) =>
      opt.name.toLowerCase().includes(query.toLowerCase())
    );
    return of(filtered).pipe(delay(100));
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SharedFormsSingleSelectAutocompleteComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedFormsSingleSelectAutocompleteComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty value', () => {
    expect(component.value).toBeNull();
    expect(component.displayValue()).toBe('');
  });

  it('should call searchFn when user types', (done) => {
    const searchSpy = vi.fn().mockReturnValue(of(mockOptions));
    fixture.componentRef.setInput('searchFn', searchSpy);
    fixture.detectChanges();

    component.searchControl.setValue('test');

    setTimeout(() => {
      expect(searchSpy).toHaveBeenCalledWith('test');
      done();
    }, 400);
  });

  it('should filter options based on search query', (done) => {
    fixture.componentRef.setInput('searchFn', mockSearchFn);
    fixture.componentRef.setInput('valueAccessorFn', 'id');
    fixture.componentRef.setInput('viewValueAccessorFn', 'name');
    fixture.detectChanges();

    component.searchControl.setValue('Option 1');

    setTimeout(() => {
      component.filteredOptions$.subscribe((options) => {
        expect(options.length).toBe(1);
        expect(options[0].name).toBe('Option 1');
        done();
      });
    }, 400);
  });

  it('should set loading state during search', (done) => {
    fixture.componentRef.setInput('searchFn', mockSearchFn);
    fixture.detectChanges();

    expect(component.loading()).toBe(false);

    component.searchControl.setValue('test');

    setTimeout(() => {
      expect(component.loading()).toBe(false);
      done();
    }, 500);
  });

  it('should respect minSearchLength', (done) => {
    const searchSpy = vi.fn().mockReturnValue(of(mockOptions));
    fixture.componentRef.setInput('searchFn', searchSpy);
    fixture.componentRef.setInput('minSearchLength', 3);
    fixture.detectChanges();

    component.searchControl.setValue('ab');

    setTimeout(() => {
      expect(searchSpy).not.toHaveBeenCalled();
      done();
    }, 400);
  });

  it('should call searchFn when minSearchLength is met', (done) => {
    const searchSpy = vi.fn().mockReturnValue(of(mockOptions));
    fixture.componentRef.setInput('searchFn', searchSpy);
    fixture.componentRef.setInput('minSearchLength', 3);
    fixture.detectChanges();

    component.searchControl.setValue('abc');

    setTimeout(() => {
      expect(searchSpy).toHaveBeenCalledWith('abc');
      done();
    }, 400);
  });

  it('should emit selectionChange when option is selected', () => {
    const selectionChangeSpy = vi.fn();
    component.selectionChange.subscribe(selectionChangeSpy);

    const mockEvent = {
      option: { value: mockOptions[0] },
    } as any;

    component.onOptionSelected(mockEvent);

    expect(selectionChangeSpy).toHaveBeenCalledWith(mockOptions[0]);
  });

  it('should update displayValue when option is selected', () => {
    fixture.componentRef.setInput('viewValueAccessorFn', 'name');
    fixture.detectChanges();

    const mockEvent = {
      option: { value: mockOptions[0] },
    } as any;

    component.onOptionSelected(mockEvent);

    expect(component.displayValue()).toBe('Option 1');
  });

  it('should clear selection', () => {
    fixture.componentRef.setInput('viewValueAccessorFn', 'name');
    fixture.detectChanges();

    component.writeValue(mockOptions[0]);
    expect(component.displayValue()).toBe('Option 1');

    component.clearSelection();

    expect(component.displayValue()).toBe('');
    expect(component.searchControl.value).toBe('');
  });

  it('should handle disabled state', () => {
    component.disabled = true;
    expect(component.searchControl.disabled).toBe(true);

    component.disabled = false;
    expect(component.searchControl.disabled).toBe(false);
  });

  it('should use valueAccessorFn to get option value', () => {
    fixture.componentRef.setInput('valueAccessorFn', 'id');
    fixture.detectChanges();

    const value = component.getValueFn(mockOptions[0]);
    expect(value).toBe('1');
  });

  it('should use viewValueAccessorFn to get display value', () => {
    fixture.componentRef.setInput('viewValueAccessorFn', 'name');
    fixture.detectChanges();

    const displayValue = component.getViewValueFn(mockOptions[0]);
    expect(displayValue).toBe('Option 1');
  });

  it('should handle error in searchFn gracefully', (done) => {
    const errorSearchFn = () => {
      throw new Error('Search failed');
    };
    fixture.componentRef.setInput('searchFn', errorSearchFn);
    fixture.detectChanges();

    component.searchControl.setValue('test');

    setTimeout(() => {
      component.filteredOptions$.subscribe((options) => {
        expect(options).toEqual([]);
        done();
      });
    }, 400);
  });

  it('should implement ControlValueAccessor', () => {
    const onChangeSpy = vi.fn();
    const onTouchedSpy = vi.fn();

    component.registerOnChange(onChangeSpy);
    component.registerOnTouched(onTouchedSpy);

    component.onChange();
    component.onTouched();

    expect(onChangeSpy).toHaveBeenCalled();
    expect(onTouchedSpy).toHaveBeenCalled();
  });

  it('should write value correctly', () => {
    fixture.componentRef.setInput('viewValueAccessorFn', 'name');
    fixture.detectChanges();

    component.writeValue(mockOptions[0]);
    expect(component.displayValue()).toBe('Option 1');

    component.writeValue(null);
    expect(component.displayValue()).toBe('');
  });
});
