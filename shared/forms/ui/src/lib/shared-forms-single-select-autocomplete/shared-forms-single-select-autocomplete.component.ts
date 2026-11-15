import {
  afterNextRender,
  Component,
  ElementRef,
  Injector,
  HostBinding,
  inject,
  input,
  Input,
  OnDestroy,
  output,
  signal,
  TemplateRef,
  viewChild,
  ChangeDetectionStrategy,
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
  combineLatest,
  concatMap,
  debounce,
  defer,
  distinctUntilChanged,
  EMPTY,
  filter,
  finalize,
  map,
  switchMap,
  catchError,
  of,
  startWith,
  take,
  timer,
  Observable,
} from 'rxjs';
import { MatAutocomplete, MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldControl } from '@angular/material/form-field';
import { FocusMonitor } from '@angular/cdk/a11y';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';

/** One page of server results; `total` counts every match, not just this page */
export interface SharedFormsSearchPage<T = unknown> {
  items: T[];
  total: number;
}

/**
 * Answers a search with every match, or with one page of them starting at `offset`
 * (the next page loads when the panel scrolls near its end)
 */
export type SharedFormsSearchFn<T = unknown> = (
  query: string,
  offset: number,
) => Observable<T[] | SharedFormsSearchPage<T>>;

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
    NgTemplateOutlet,
  ],
  templateUrl: './shared-forms-single-select-autocomplete.component.html',
  styleUrl: './shared-forms-single-select-autocomplete.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: MatFormFieldControl, useExisting: SharedFormsSingleSelectAutocompleteComponent }],
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

  onFocusIn(event: FocusEvent) {
    this.wasFocused.set(true);
    if (!this.focused) {
      this.focused = true;
      this.stateChanges.next();
    }
    // Trigger autocomplete to open by ensuring there's a value change
    if (!this.searchControl.value) {
      this.searchControl.setValue('', { emitEvent: true });
    }
    // typing replaces the shown pick; after the click, which would drop the selection
    const searchInput = event.target as HTMLInputElement;
    setTimeout(() => searchInput.select());
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
  private readonly injector = inject(Injector);

  selectionChange = output<any>();
  touched = false;

  /** A new function searches again with the current text (pass one when the results would change) */
  searchFn = input.required<SharedFormsSearchFn>();

  // Display value accessor
  valueAccessorFn = input<((value: any) => any) | string | null>(null);
  viewValueAccessorFn = input<((value: any) => any) | string | null>(null);

  /** Options that show but can't be picked. `never`: takes a function of any option type */
  isOptionDisabledFn = input<(option: never) => boolean>(() => false);

  /** Renders each option's content, with the option as `$implicit`; default: its view value */
  optionTemplate = input<TemplateRef<{ $implicit: unknown }> | null>(null);

  // Debounce time in ms
  debounceTime = input(500);

  // Minimum characters before search
  minSearchLength = input(0);

  dataTestId = input<string>(this.id);

  searchControl = new FormControl('');
  displayValue = signal('');
  loading = signal(false);

  /** What the search has loaded so far */
  results = signal<unknown[]>([]);

  /** Every match on the server; null when the search answered with all of them */
  total = signal<number | null>(null);

  /** The last search errored */
  failed = signal(false);

  /** Nothing loads until the box first gets focus */
  private readonly wasFocused = signal(false);

  private readonly loadMore$ = new Subject<void>();

  inputElement = viewChild<ElementRef>('searchInput');

  autocomplete = viewChild<MatAutocomplete>('auto');

  public readonly ngControl = inject(NgControl, { optional: true, self: true }) ?? ({} as NgControl);

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

    const query$ = this.searchControl.valueChanges.pipe(
      debounce(() => timer(this.debounceTime())),
      startWith(this.searchControl.value),
      // a picked option sets the control to the option itself
      map((query) => (typeof query === 'string' ? query : '')),
      distinctUntilChanged(),
    );
    const firstFocus$ = toObservable(this.wasFocused).pipe(filter(Boolean), take(1));
    combineLatest([query$, toObservable(this.searchFn), firstFocus$])
      .pipe(
        switchMap(([query, searchFn]) => {
          this.results.set([]);
          this.total.set(null);
          if (query.length < this.minSearchLength()) return EMPTY;
          return this.loadMore$.pipe(
            filter(() => this.hasMore() && !this.loading()),
            startWith(undefined),
            concatMap(() => this.fetch(searchFn, query, this.results().length)),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((result) => {
        if (Array.isArray(result)) {
          this.results.set(result);
          return;
        }
        this.results.update((loaded) => [...loaded, ...result.items]);
        this.total.set(result.total);
      });
  }

  ngOnDestroy(): void {
    this.stateChanges.complete();
    this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
  }

  /** The input's text: writeValue already hands it a string, a picked option comes as itself */
  displayWith = (value: unknown) =>
    value !== null && typeof value === 'object' ? this.getViewValueFn(value) : (value ?? '');

  isDisabled(option: unknown): boolean {
    return this.isOptionDisabledFn()(option as never);
  }

  hasMore(): boolean {
    const total = this.total();
    return total !== null && this.results().length < total;
  }

  private fetch(searchFn: SharedFormsSearchFn, query: string, offset: number) {
    this.loading.set(true);
    this.failed.set(false);
    return defer(() => searchFn(query, offset)).pipe(
      catchError(() => {
        this.failed.set(true);
        return of([]);
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  /** Within one panel-height of the end: load the next page */
  private readonly onPanelScroll = (event: Event) => {
    const panel = event.target as HTMLElement;
    if (panel.scrollHeight - panel.scrollTop - panel.clientHeight < panel.clientHeight) this.loadMore$.next();
  };

  onPanelOpened() {
    // the panel renders after `opened`
    afterNextRender(() => this.autocomplete()?.panel?.nativeElement.addEventListener('scroll', this.onPanelScroll), {
      injector: this.injector,
    });
  }

  onPanelClosed() {
    this.autocomplete()?.panel?.nativeElement.removeEventListener('scroll', this.onPanelScroll);
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
