import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostBinding,
  inject,
  input,
  Input,
  OnDestroy,
  Optional,
  output,
  Self,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NgControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { MatSelect, MatSelectChange, MatSelectModule } from '@angular/material/select';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { FocusMonitor } from '@angular/cdk/a11y';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldControl } from '@angular/material/form-field';

@Component({
    selector: 'lib-shared-forms-single-select',
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatSelectModule,
        MatOptionModule,
        MatProgressBarModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatDividerModule,
    ],
    templateUrl: './shared-forms-single-select.component.html',
    styleUrl: './shared-forms-single-select.component.scss',
    providers: [{ provide: MatFormFieldControl, useExisting: SharedFormsSingleSelectComponent }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SharedFormsSingleSelectComponent implements ControlValueAccessor, OnDestroy {
  /*****************************************************************************
   * ControlValueAccessor Required Fields
   ****************************************************************************/

  get value(): any | null {
    return this.ngControl.control?.value || null;
  }

  onChange() {
    /* empty */
  }

  onTouched() {
    /* empty */
  }

  writeValue() {
    /* empty */
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

  readonly controlType = 'lib-shared-forms-single-select';

  static nextId = 0;

  @HostBinding() id = `${this.controlType}-${SharedFormsSingleSelectComponent.nextId + 1}`;

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
    this.matSelect()?.setDisabledState(disabled);
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
    const matSelectWrapperClassElement = this.elementRef.nativeElement.querySelector('component-container');
    matSelectWrapperClassElement?.setAttribute('aria-describedby', ids.join(' '));
  }

  onContainerClick(event: MouseEvent) {
    if (this.disabled) return;
    this.matSelect()?.onContainerClick();
    event.stopPropagation();
  }

  /*****************************************************************************
   * SharedFormsSingleSelectComponent fields
   ****************************************************************************/

  readonly focusMonitor = inject(FocusMonitor);

  readonly elementRef = inject(ElementRef<HTMLElement>);

  openedChange = output<boolean>();

  selectionChange = output<MatSelectChange>();

  touched = false;

  setFirstOption = input(true);

  error = input(true);

  multiInstanceTerm = input('data');

  singleInstanceTerm = input('datum');

  searchHint = input<string>();

  dataTestId = input<string>(this.id);

  loading = input(false);

  isSearchFocused = false;

  valueAccessorFn = input<((value: any) => any) | string | null>(null);

  viewValueAccessorFn = input<((value: any) => any) | string | null>(null);

  /**
   * This can be expensive and I would recommend not using it if you can help it
   * @param v1
   * @param v2
   * @returns
   */
  defaultCompareWithFn = (v1: any, v2: any): boolean => {
    return JSON.stringify(v1) === JSON.stringify(v2);
  };

  /**
   * Function to compare the option values with the selected values.
   * The first argument is a value from an option.
   * The second is a value from the selection.
   * A boolean should be returned.
   *
   * @param v1 the value from an option
   * @param v2 the value from the selection
   * @returns a boolean representing if the option is selcted or not
   */
  compareWithFn = input(this.defaultCompareWithFn);

  trackFn = input<((index: number, value: any) => string) | string | null>(null);

  getTrackFn(index: number, option: any) {
    const trackFn = this.trackFn();
    if (!trackFn) return index;
    if (typeof trackFn === 'string') {
      return option[trackFn];
    }
    trackFn(index, option);
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

  // sortOnLoad = input(false);

  // defaultSortFn = (a: any, b: any) => {
  //   const viewValueAccessorFn = this.viewValueAccessorFn()
  //   if (viewValueAccessorFn && {}.toString.call(viewValueAccessorFn) === '[object Function]') {
  //     const aa = String(viewValueAccessorFn(a)?.trim().toLowerCase());
  //     const bb = String(viewValueAccessorFn(b)?.trim().toLowerCase());
  //     if (aa > bb) return 1;
  //     if (bb > aa) return -1;
  //   }
  //   return 0;
  // }
  // sortFn = input(this.defaultSortFn);

  defaultIsOptionDisabledFn(_option: any, ..._params: any[]): boolean {
    return false;
  }
  isOptionDisabledFn = input(this.defaultIsOptionDisabledFn);

  isOptionDisabledFnArgs = input<any[]>([]);

  getIsOptionDisabled(option: any): boolean {
    return coerceBooleanProperty(this.isOptionDisabledFn()(option, ...this.isOptionDisabledFnArgs()));
  }

  noneOptionText = input<string | null>(null);

  defaultOptions = input<any | null>(null);

  options = input<any[]>([]);

  searchInputValue = signal('');

  optionsFiltered = computed(() => {
    let allOptions: any[] = [];
    if (this.defaultOptions()) {
      allOptions = [...this.defaultOptions()];
    }
    allOptions = [...allOptions, ...this.options()];
    if (!this.searchInputValue()) return allOptions;
    return allOptions.filter((option) =>
      this.getViewValueFn(option).toLocaleLowerCase().includes(this.searchInputValue().trim().toLowerCase()),
    );
  });

  matSelect = viewChild<MatSelect>('matSelect');

  searchInput = viewChild<ElementRef>('searchInput');

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    // @Optional() parentForm: NgForm,
    // @Optional() parentFormGroup: FormGroupDirective,
  ) {
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

  asFormControl(fc: AbstractControl | null) {
    return fc as FormControl;
  }

  onOpenedChange(isOpen: boolean) {
    if (isOpen) this.searchInput()?.nativeElement.focus();
    this.openedChange.emit(isOpen);
  }
}
