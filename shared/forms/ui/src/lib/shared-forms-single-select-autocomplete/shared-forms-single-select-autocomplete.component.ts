import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  inject,
  input,
  Input,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NgControl,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  of,
  startWith,
  tap,
  Observable,
} from 'rxjs';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldControl } from '@angular/material/form-field';
import { FocusMonitor } from '@angular/cdk/a11y';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'lib-shared-forms-single-select-autocomplete',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    AsyncPipe,
  ],
  templateUrl: './shared-forms-single-select-autocomplete.component.html',
  styleUrl: './shared-forms-single-select-autocomplete.component.scss',
  providers: [{ provide: MatFormFieldControl, useExisting: SharedFormsSingleSelectAutocompleteComponent }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedFormsSingleSelectAutocompleteComponent implements ControlValueAccessor, OnDestroy {
  /*****************************************************************************
   * ControlValueAccessor Required Fields
   ****************************************************************************/

  get value(): any | null {
    return this.ngControl.control?.value || null;
  }

  onChange: (value: any) => void = () => {
    /* empty */
  };

  onTouched: () => void = () => {
    /* empty */
  };

  writeValue(value: any) {
    if (value) {
      // If value is an object, get the display value
      // If value is a primitive (like an ID), just display it as-is
      const displayValue = typeof value === 'object' ? this.getViewValueFn(value) : value;
      this.displayValue.set(displayValue);
      this.searchControl.setValue(displayValue, { emitEvent: false });
    } else {
      this.displayValue.set('');
      this.searchControl.setValue('', { emitEvent: false });
    }
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  /*****************************************************************************
   * MatFormField Required Fields
   ****************************************************************************/

  stateChanges = new Subject<void>();

  readonly controlType = 'lib-shared-forms-single-select-autocomplete';

  static nextId = 0;

  @HostBinding() id = `${this.controlType}-${SharedFormsSingleSelectAutocompleteComponent.nextId + 1}`;

  private _placeholder = '';
  @Input() set placeholder(placeholder: string) {
    this._placeholder = placeholder;
    this.stateChanges.next();
  }
  get placeholder(): string {
    return this._placeholder;
  }

  private _required = false;
  @Input() set required(required: boolean) {
    this._required = required;
    this.stateChanges.next();
  }
  get required(): boolean {
    return this._required;
  }

  private _disabled = false;
  @Input() set disabled(disabled: boolean) {
    this._disabled = disabled;
    if (disabled) {
      this.searchControl.disable({ emitEvent: false });
    } else {
      this.searchControl.enable({ emitEvent: false });
    }
    this.stateChanges.next();
  }
  get disabled(): boolean {
    return this._disabled;
  }

  private _errorState = false;

  get errorState(): boolean {
    const currentState = this.ngControl.errors !== null && !!this.ngControl.touched;
    const didStateChange = this._errorState !== currentState;
    this._errorState = currentState;
    if (didStateChange) this.stateChanges.next();
    return currentState;
  }

  focused = false;

  onFocusIn(_event: FocusEvent) {
    if (!this.focused) {
      this.focused = true;
      this.stateChanges.next();
    }
    // Trigger autocomplete to open by ensuring there's a value change
    if (!this.searchControl.value) {
      this.searchControl.setValue('', { emitEvent: true });
    }
  }

  onFocusOut(event: FocusEvent) {
    if (!this.elementRef.nativeElement.contains(event.relatedTarget as Element)) {
      this.touched = true;
      this.focused = false;
      this.onTouched();
      this.stateChanges.next();
    }
  }

  get empty() {
    return !this.ngControl.control?.value;
  }

  @HostBinding('class.floating')
  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  @Input() 'aria-describedby'!: string;

  setDescribedByIds(ids: string[]) {
    const inputElement = this.elementRef.nativeElement.querySelector('input');
    inputElement?.setAttribute('aria-describedby', ids.join(' '));
  }

  onContainerClick(_event: MouseEvent) {
    if (this.disabled) return;
    this.inputElement()?.nativeElement.focus();
  }

  /*****************************************************************************
   * SharedFormsSingleSelectAutocompleteComponent fields
   ****************************************************************************/

  private readonly focusMonitor = inject(FocusMonitor);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  selectionChange = output<any>();
  touched = false;

  // Search function that returns Observable<T[]>
  searchFn = input.required<(query: string) => Observable<any[]>>();

  // Display value accessor
  valueAccessorFn = input<((value: any) => any) | string | null>(null);
  viewValueAccessorFn = input<((value: any) => any) | string | null>(null);

  // Debounce time in ms
  debounceTime = input(500);

  // Minimum characters before search
  minSearchLength = input(0);

  dataTestId = input<string>(this.id);

  searchControl = new FormControl('');
  displayValue = signal('');
  loading = signal(false);

  inputElement = viewChild<ElementRef>('searchInput');

  public readonly ngControl = inject(NgControl, { optional: true, self: true }) ?? ({} as NgControl);

  // Filtered options from server
  filteredOptions$: Observable<any[]> = this.searchControl.valueChanges.pipe(
    startWith(''),
    debounceTime(this.debounceTime()),
    distinctUntilChanged(),
    switchMap((query) => {
      const searchQuery = typeof query === 'string' ? query : '';

      if (searchQuery.length < this.minSearchLength()) {
        this.loading.set(false);
        return of([]);
      }

      this.loading.set(true);
      return this.searchFn()(searchQuery).pipe(
        tap(() => this.loading.set(false)),
        catchError(() => {
          this.loading.set(false);
          return of([]);
        }),
      );
    }),
  );

  constructor() {
    this.focusMonitor
      .monitor(this.elementRef.nativeElement, true)
      .pipe(takeUntilDestroyed())
      .subscribe((origin) => {
        this.focused = !!origin;
        this.stateChanges.next();
      });

    if (this.ngControl !== null) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnDestroy(): void {
    this.stateChanges.complete();
    this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
  }

  getValueFn(option: any) {
    const valueAccessorFn = this.valueAccessorFn();
    if (!valueAccessorFn) return option;
    if (typeof valueAccessorFn === 'string') {
      return option[valueAccessorFn];
    }
    return valueAccessorFn(option);
  }

  getViewValueFn(option: any) {
    const viewValueAccessorFn = this.viewValueAccessorFn();
    if (!viewValueAccessorFn) return option;
    if (typeof viewValueAccessorFn === 'string') {
      return option[viewValueAccessorFn as string];
    }
    return (viewValueAccessorFn as (value: any) => any)(option);
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent) {
    const value = event.option.value;
    this.displayValue.set(this.getViewValueFn(value));
    this.onChange(this.getValueFn(value));
    this.selectionChange.emit(value);
    this.touched = true;
  }

  clearSelection() {
    this.searchControl.setValue('');
    this.displayValue.set('');
    this.onChange(null);
    this.touched = true;
  }

  asFormControl(fc: AbstractControl | null) {
    return fc as FormControl;
  }
}
