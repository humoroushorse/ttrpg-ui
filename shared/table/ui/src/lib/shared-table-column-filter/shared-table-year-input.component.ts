import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ErrorStateMatcher, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { YEAR_DATE_FORMATS } from './filter-date';

const YEAR = /^\d{4}$/;

/**
 * A year field with a year picker (the calendar opens on years and closes on a pick).
 * Its own date formats, so the input shows "2024"; the parent's adapter reads a typed year.
 */
@Component({
  selector: 'lib-shared-table-year-input',
  imports: [MatDatepickerModule, MatFormFieldModule, MatInputModule],
  providers: [{ provide: MAT_DATE_FORMATS, useValue: YEAR_DATE_FORMATS }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './shared-table-year-input.component.html',
})
export class SharedTableYearInputComponent {
  readonly label = input.required<string>();

  /** 'YYYY', or '' for none */
  readonly year = input('');

  /** Shown under the field, which turns invalid */
  readonly error = input<string | null>(null);

  /** The picker greys out years outside these */
  readonly min = input<Date | null>(null);

  readonly max = input<Date | null>(null);

  readonly yearChange = output<string>();

  protected readonly date = computed(() => (YEAR.test(this.year()) ? new Date(Number(this.year()), 0, 1) : null));

  protected readonly errorState: ErrorStateMatcher = { isErrorState: () => !!this.error() };

  onYearSelected(date: Date, picker: MatDatepicker<Date>): void {
    this.yearChange.emit(String(date.getFullYear()));
    picker.close();
  }

  /** Typed, then committed (blur or Enter) */
  onDateChange(date: Date | null): void {
    this.yearChange.emit(date ? String(date.getFullYear()) : '');
  }
}
