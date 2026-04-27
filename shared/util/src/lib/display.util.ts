import { Pipe, PipeTransform } from '@angular/core';

/** The placeholder shown when a value is empty/null/undefined. Change here to update everywhere. */
export const EMPTY_VALUE = '--';

/**
 * Returns the value as a string if it is non-empty, otherwise returns EMPTY_VALUE.
 * Handles: null, undefined, '', '   ', [], 0 (treated as valid).
 */
export function displayValue(
  value: string | number | null | undefined | unknown[],
  fallback = EMPTY_VALUE
): { text: string; isEmpty: boolean } {
  if (value === null || value === undefined) {
    return { text: fallback, isEmpty: true };
  }
  if (typeof value === 'string' && value.trim() === '') {
    return { text: fallback, isEmpty: true };
  }
  if (Array.isArray(value) && value.length === 0) {
    return { text: fallback, isEmpty: true };
  }
  return { text: String(value), isEmpty: false };
}

/**
 * Returns the display text for a value.
 * Usage: {{ item.assignee_id | displayValue }}
 * Returns EMPTY_VALUE for null/undefined/empty, otherwise the value as a string.
 */
@Pipe({ name: 'displayValue', standalone: true })
export class DisplayValuePipe implements PipeTransform {
  transform(value: string | number | null | undefined | unknown[], fallback = EMPTY_VALUE): string {
    return displayValue(value, fallback).text;
  }
}

/**
 * Returns true if the value is considered empty (would show EMPTY_VALUE).
 * Usage: [class.empty-value]="item.assignee_id | isEmptyValue"
 */
@Pipe({ name: 'isEmptyValue', standalone: true })
export class IsEmptyValuePipe implements PipeTransform {
  transform(value: string | number | null | undefined | unknown[]): boolean {
    return displayValue(value).isEmpty;
  }
}

/** @deprecated use IsEmptyValuePipe instead */
export function isEmpty(value: string | number | null | undefined | unknown[]): boolean {
  return displayValue(value).isEmpty;
}
