/**
 * Date Models
 * Type definitions for date formatting and timezone handling
 */

/**
 * Available date format options
 */
export enum DateFormat {
  Short = 'short',
  Medium = 'medium',
  Long = 'long',
  Full = 'full',
  ShortDate = 'shortDate',
  MediumDate = 'mediumDate',
  LongDate = 'longDate',
  FullDate = 'fullDate',
  ShortTime = 'shortTime',
  MediumTime = 'mediumTime',
  LongTime = 'longTime',
  FullTime = 'fullTime',
}

/**
 * Date format option with example
 */
export interface DateFormatOption {
  value: DateFormat;
  label: string;
  example: string;
}

/**
 * Locale option
 */
export interface LocaleOption {
  code: string;
  name: string;
}

/**
 * Timezone option
 */
export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}
