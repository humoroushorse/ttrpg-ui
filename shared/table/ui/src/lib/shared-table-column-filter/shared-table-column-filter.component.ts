import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DateAdapter, ErrorStateMatcher, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { SharedModels } from '@ttrpg-ui/shared/models';
import { TableModels } from '@ttrpg-ui/shared/table/models';
import { debounceTime, exhaustMap, filter, scan, startWith, Subject, tap } from 'rxjs';
import { FilterChange, operatorLabel, resolveFilterParams, takesNoValue, validateFilterValue } from './column-filter';
import { FilterDateAdapter, toDayString, toLocalDate } from './filter-date';
import { SharedTableYearInputComponent } from './shared-table-year-input.component';

type Filter = SharedModels.Store.Filter;
type FilterType = SharedModels.Store.FilterType;
type SetValue = string | null;

/** A known list gets a search box past this many options */
const SEARCH_AFTER = 8;
/** API list page size */
const PAGE_SIZE = 25;
/** How close to the bottom (px) the API list loads its next page */
const LOAD_MORE_AT = 48;
const SEARCH_DEBOUNCE_MS = 300;

const YEAR = /^\d{4}$/;
const DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Labels the API lists have loaded, per `appValuesPage`, so checked values keep their names
 * the next time the menu opens (the filter component only lives while the menu is open).
 */
const API_LABELS = new WeakMap<object, Map<SetValue, string>>();

const labelsFor = (fetch: object): Map<SetValue, string> => {
  let labels = API_LABELS.get(fetch);
  if (!labels) API_LABELS.set(fetch, (labels = new Map()));
  return labels;
};

/**
 * A draft seeded from the applied filter when the menu opens. Not re-seeded after that:
 * the table applies typing after a delay, and re-seeding would undo what was typed since.
 */
const seeded = <T>(initial: () => T) =>
  linkedSignal<T, T>({ source: initial, computation: (value, previous) => (previous ? previous.value : value) });

/** One column's filter, shown at the top of its column menu */
@Component({
  selector: 'lib-shared-table-column-filter',
  imports: [
    NgTemplateOutlet,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatRadioModule,
    MatSelectModule,
    MatDatepickerModule,
    SharedTableYearInputComponent,
  ],
  // its own date setup, so the pickers work in any app and typed dates stay local
  providers: [
    { provide: DateAdapter, useClass: FilterDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },
  ],
  templateUrl: './shared-table-column-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedTableColumnFilterComponent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly columnDef = input.required<TableModels.ColumnDef<any>>();

  /** The applied filter */
  readonly model = input<Filter | undefined>();

  /** Set filter values when the column lists none (tables holding every row pass the column's values) */
  readonly fallbackValues = input<SetValue[]>([]);

  readonly changed = output<FilterChange>();

  private readonly appDefaults = inject(TableModels.SHARED_TABLE_FILTER_DEFAULTS);

  protected readonly filterName = computed(() => TableModels.columnFilterName(this.columnDef()));

  protected readonly params = computed<TableModels.ColumnFilterParams>(() => {
    const name = this.filterName();
    return name ? resolveFilterParams(name, this.appDefaults, this.columnDef().filterParams) : {};
  });

  protected readonly operators = computed(() =>
    (this.params().filterOptions ?? []).map((type) => ({ type, label: operatorLabel(type, this.filterName()) })),
  );

  protected readonly granularity = computed(() => this.params().appGranularity ?? 'date');

  protected readonly multi = computed(() => this.params().appSelectMode !== 'single');

  // drafts
  protected readonly type = seeded<FilterType | undefined>(() => {
    const model = this.model();
    if (model && model.filterType !== 'set') return model.type;
    return this.filterName() === 'appBooleanColumnFilter' ? undefined : this.params().defaultOption;
  });

  protected readonly text = seeded(() => {
    const model = this.model();
    return model?.filterType === 'text' ? (model.filter ?? '') : '';
  });

  protected readonly from = seeded(() => this.inputValue('from'));

  protected readonly to = seeded(() => this.inputValue('to'));

  protected readonly selected = seeded<SetValue[]>(() => {
    const model = this.model();
    return model?.filterType === 'set' ? model.values : [];
  });

  protected readonly noValue = computed(() => takesNoValue(this.type()));

  protected readonly isRange = computed(() => this.type() === 'inRange');

  // validation (only for the fields the operator uses)
  protected readonly fromError = computed(() => {
    if (this.noValue()) return null;
    const raw = this.filterName() === 'agTextColumnFilter' ? this.text() : this.from();
    return validateFilterValue(this.filterName(), this.params(), raw, 'from');
  });

  protected readonly toError = computed(() =>
    this.isRange() ? validateFilterValue(this.filterName(), this.params(), this.to(), 'to') : null,
  );

  /** Marks a field invalid without a form control: mat-form-field then shows its <mat-error> */
  protected readonly fromErrorState: ErrorStateMatcher = { isErrorState: () => !!this.fromError() };

  protected readonly toErrorState: ErrorStateMatcher = { isErrorState: () => !!this.toError() };

  /** Number input attributes, so the spinner stays in range */
  protected readonly numberAttrs = computed(() => {
    const { appMin, appMax, appIntegerOnly } = this.params();
    return { min: appMin ?? null, max: appMax ?? null, step: appIntegerOnly ? 1 : 'any' };
  });

  /** Date picker limits (the calendar greys out the rest) */
  protected readonly dateLimits = computed(() => {
    const { minValidDate, maxValidDate, minValidYear, maxValidYear } = this.params();
    return {
      min: toLocalDate(minValidDate) ?? (minValidYear !== undefined ? new Date(minValidYear, 0, 1) : null),
      max: toLocalDate(maxValidDate) ?? (maxValidYear !== undefined ? new Date(maxValidYear, 11, 31) : null),
    };
  });

  protected readonly active = computed(() => !!this.model());

  // known list
  protected readonly search = signal('');

  protected readonly options = computed<TableModels.SetFilterOption[]>(() => {
    const { values, valueFormatter } = this.params();
    return (values ?? this.fallbackValues()).map((value) => ({
      value,
      label: valueFormatter ? valueFormatter({ value }) : (value ?? '(Blank)'),
    }));
  });

  protected readonly showSearch = computed(
    () => this.filterName() === 'appApiSetColumnFilter' || this.options().length > SEARCH_AFTER,
  );

  protected readonly shownOptions = computed(() => {
    const search = this.search().trim().toLowerCase();
    const options = this.options();
    return search ? options.filter((o) => o.label.toLowerCase().includes(search)) : options;
  });

  // API list
  private readonly apiSearch = toSignal(toObservable(this.search).pipe(debounceTime(SEARCH_DEBOUNCE_MS)), {
    initialValue: '',
  });

  private readonly loadMore$ = new Subject<void>();

  protected readonly apiPages = rxResource({
    params: () => {
      const fetch = this.filterName() === 'appApiSetColumnFilter' ? this.params().appValuesPage : undefined;
      return fetch ? { fetch, search: this.apiSearch() } : undefined;
    },
    // pages pile up as the list scrolls; a new search starts over
    stream: ({ params: { fetch, search } }) => {
      const labels = labelsFor(fetch);
      let offset = 0;
      let total = Number.POSITIVE_INFINITY;
      return this.loadMore$.pipe(
        startWith(undefined),
        filter(() => offset < total),
        exhaustMap(() => fetch({ search, offset, limit: PAGE_SIZE })),
        tap((page) => {
          offset += page.options.length;
          total = page.options.length ? page.total : offset;
          page.options.forEach((o) => labels.set(o.value, o.label));
        }),
        scan<TableModels.SetFilterPage, TableModels.SetFilterPage>(
          (all, page) => ({ options: [...all.options, ...page.options], total: page.total }),
          { options: [], total: 0 },
        ),
      );
    },
  });

  /** Checked values first (with the names loaded so far), then the loaded options */
  protected readonly apiOptions = computed(() => {
    const fetch = this.params().appValuesPage;
    const page = this.apiPages.hasValue() ? this.apiPages.value() : undefined;
    if (!fetch) return { checked: [], rest: [], more: false };
    const labels = labelsFor(fetch);
    const selected = new Set(this.selected());
    return {
      checked: this.selected().map((value) => ({ value, label: labels.get(value) ?? value ?? '(Blank)' })),
      rest: (page?.options ?? []).filter((o) => !selected.has(o.value)),
      more: !!page && page.options.length < page.total,
    };
  });

  protected isSelected(value: SetValue): boolean {
    return this.selected().includes(value);
  }

  onTypeChange(type: FilterType): void {
    this.type.set(type);
    this.emit(false);
  }

  onTextInput(value: string): void {
    this.text.set(value);
    this.emit(true);
  }

  onRangeInput(end: 'from' | 'to', value: string): void {
    (end === 'from' ? this.from : this.to).set(value);
    this.emit(true);
  }

  /** A picked or committed date ('YYYY-MM-DD') or year ('YYYY'): applies right away */
  onDatePicked(end: 'from' | 'to', value: string): void {
    (end === 'from' ? this.from : this.to).set(value);
    this.emit(false);
  }

  protected readonly toLocalDate = toLocalDate;

  protected readonly toDayString = toDayString;

  onBooleanChange(value: FilterType | 'any'): void {
    this.type.set(value === 'any' ? undefined : value);
    this.emit(false);
  }

  onToggle(value: SetValue, checked: boolean): void {
    const rest = this.selected().filter((v) => v !== value);
    this.selected.set(!this.multi() ? (checked ? [value] : []) : checked ? [...rest, value] : rest);
    this.emit(false);
  }

  onSelectAllShown(): void {
    this.selected.set([...new Set([...this.selected(), ...this.shownOptions().map((o) => o.value)])]);
    this.emit(false);
  }

  onListScroll(event: Event): void {
    const list = event.target as HTMLElement;
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - LOAD_MORE_AT) this.loadMore$.next();
  }

  /** For keyboards and lists too short to scroll */
  onLoadMore(): void {
    this.loadMore$.next();
  }

  onClear(): void {
    this.text.set('');
    this.from.set('');
    this.to.set('');
    this.selected.set([]);
    if (this.filterName() === 'appBooleanColumnFilter') this.type.set(undefined);
    this.changed.emit({ model: null, debounceMs: 0 });
  }

  private emit(typing: boolean): void {
    // an invalid value isn't applied: the filter keeps what it had while the error shows
    if (this.fromError() || this.toError()) return;
    this.changed.emit({ model: this.build(), debounceMs: typing ? (this.params().debounceMs ?? 0) : 0 });
  }

  /** The filter model the drafts make, or null when they don't make one yet */
  private build(): Filter | null {
    const type = this.type();
    switch (this.filterName()) {
      case 'agTextColumnFilter': {
        if (!type) return null;
        const text = this.text().trim();
        if (takesNoValue(type)) return { filterType: 'text', type: type as SharedModels.Store.TextFilterType };
        return text ? { filterType: 'text', type: type as SharedModels.Store.TextFilterType, filter: text } : null;
      }
      case 'agNumberColumnFilter': {
        if (!type) return null;
        const numberType = type as SharedModels.Store.NumberFilterType;
        if (takesNoValue(type)) return { filterType: 'number', type: numberType };
        const from = this.from().trim() === '' ? NaN : Number(this.from());
        const to = this.to().trim() === '' ? NaN : Number(this.to());
        if (Number.isNaN(from) || (type === 'inRange' && Number.isNaN(to))) return null;
        return { filterType: 'number', type: numberType, filter: from, filterTo: type === 'inRange' ? to : null };
      }
      case 'agDateColumnFilter': {
        if (!type || this.granularity() === 'datetime') return null;
        const dateType = type as SharedModels.Store.DateFilterType;
        if (takesNoValue(type)) return { filterType: 'date', type: dateType, dateFrom: null, dateTo: null };
        const from = this.toDate(this.from());
        const to = this.toDate(this.to());
        if (!from || (type === 'inRange' && !to)) return null;
        return { filterType: 'date', type: dateType, dateFrom: from, dateTo: type === 'inRange' ? to : null };
      }
      case 'appBooleanColumnFilter':
        return type ? { filterType: 'boolean', type: type as SharedModels.Store.BooleanFilterType } : null;
      case 'appSetColumnFilter':
      case 'appApiSetColumnFilter':
        return this.selected().length ? { filterType: 'set', values: this.selected() } : null;
      default:
        return null;
    }
  }

  /** 'YYYY-MM-DD' from the input (a year input gives 'YYYY'), or null if it isn't one yet */
  private toDate(value: string): string | null {
    const trimmed = value.trim();
    if (this.granularity() === 'year') return YEAR.test(trimmed) ? `${trimmed}-01-01` : null;
    return DAY.test(trimmed) ? trimmed : null;
  }

  /** The applied number/date as the input shows it */
  private inputValue(end: 'from' | 'to'): string {
    const model = this.model();
    if (model?.filterType === 'number') return (end === 'from' ? model.filter : model.filterTo)?.toString() ?? '';
    if (model?.filterType !== 'date') return '';
    const date = end === 'from' ? model.dateFrom : model.dateTo;
    if (!date) return '';
    return this.granularity() === 'year' ? date.slice(0, 4) : date.slice(0, 10);
  }
}
