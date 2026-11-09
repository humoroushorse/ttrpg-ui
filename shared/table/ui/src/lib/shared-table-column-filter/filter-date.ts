import { Injectable } from '@angular/core';
import { MAT_NATIVE_DATE_FORMATS, MatDateFormats, NativeDateAdapter } from '@angular/material/core';

const YEAR = /^\d{4}$/;
const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A 'YYYY-MM-DD' filter value as a local date (the picker's dates are local midnights) */
export const toLocalDate = (day: string | null | undefined): Date | null => {
  const match = DAY.exec(day ?? '');
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
};

/** A picked date as 'YYYY-MM-DD', from its local parts (toISOString would shift it a day west of Greenwich) */
export const toDayString = (date: Date | null | undefined): string => {
  if (!date || Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/**
 * The native adapter, but a typed "2024" or "2024-03-05" is a local date.
 * `Date.parse` reads those as UTC midnight, which is the day (or year) before west of Greenwich.
 */
@Injectable()
export class FilterDateAdapter extends NativeDateAdapter {
  override parse(value: unknown, parseFormat?: unknown): Date | null {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (YEAR.test(trimmed)) return new Date(Number(trimmed), 0, 1);
      const day = toLocalDate(trimmed);
      if (day) return day;
    }
    return super.parse(value, parseFormat);
  }
}

/** The input shows only the year */
export const YEAR_DATE_FORMATS: MatDateFormats = {
  ...MAT_NATIVE_DATE_FORMATS,
  display: { ...MAT_NATIVE_DATE_FORMATS.display, dateInput: { year: 'numeric' } },
};
