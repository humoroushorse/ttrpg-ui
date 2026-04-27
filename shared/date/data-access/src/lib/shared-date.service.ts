/**
 * Shared Date Service
 * Manages timezone, locale, and date format preferences
 */

import { Injectable, signal } from '@angular/core';
import { DateFormat, DateFormatOption, LocaleOption, TimezoneOption } from '@ttrpg-ui/shared/date/models';

@Injectable({
  providedIn: 'root',
})
export class SharedDateService {
  /**
   * User's timezone (IANA format, e.g., 'America/Denver')
   */
  public readonly timezone = signal<string>(this.detectTimezone());

  /**
   * User's locale (e.g., 'en-US')
   */
  public readonly locale = signal<string>(this.detectLocale());

  /**
   * Preferred date format
   */
  public readonly dateFormat = signal<DateFormat>(DateFormat.Medium);

  /**
   * Available date format options with examples
   */
  public readonly dateFormatOptions: DateFormatOption[] = [
    { value: DateFormat.Short, label: 'Short', example: '1/12/26, 12:00 AM' },
    { value: DateFormat.Medium, label: 'Medium', example: 'Jan 12, 2026, 12:00:00 AM' },
    { value: DateFormat.Long, label: 'Long', example: 'January 12, 2026 at 12:00:00 AM MST' },
    {
      value: DateFormat.Full,
      label: 'Full',
      example: 'Monday, January 12, 2026 at 12:00:00 AM Mountain Standard Time',
    },
    { value: DateFormat.ShortDate, label: 'Short Date', example: '1/12/26' },
    { value: DateFormat.MediumDate, label: 'Medium Date', example: 'Jan 12, 2026' },
    { value: DateFormat.LongDate, label: 'Long Date', example: 'January 12, 2026' },
    { value: DateFormat.FullDate, label: 'Full Date', example: 'Monday, January 12, 2026' },
    { value: DateFormat.ShortTime, label: 'Short Time', example: '12:00 AM' },
    { value: DateFormat.MediumTime, label: 'Medium Time', example: '12:00:00 AM' },
    { value: DateFormat.LongTime, label: 'Long Time', example: '12:00:00 AM MST' },
    { value: DateFormat.FullTime, label: 'Full Time', example: '12:00:00 AM Mountain Standard Time' },
  ];

  /**
   * Common locale options (subset for better UX)
   */
  public readonly commonLocaleOptions: LocaleOption[] = [
    { code: 'en-US', name: 'English (United States)' },
    { code: 'en-GB', name: 'English (United Kingdom)' },
    { code: 'en-CA', name: 'English (Canada)' },
    { code: 'en-AU', name: 'English (Australia)' },
    { code: 'es-ES', name: 'Spanish (Spain)' },
    { code: 'es-MX', name: 'Spanish (Mexico)' },
    { code: 'fr-FR', name: 'French (France)' },
    { code: 'fr-CA', name: 'French (Canada)' },
    { code: 'de-DE', name: 'German (Germany)' },
    { code: 'it-IT', name: 'Italian (Italy)' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)' },
    { code: 'pt-PT', name: 'Portuguese (Portugal)' },
    { code: 'ja-JP', name: 'Japanese (Japan)' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'zh-TW', name: 'Chinese (Traditional)' },
    { code: 'ko-KR', name: 'Korean (Korea)' },
    { code: 'ru-RU', name: 'Russian (Russia)' },
    { code: 'ar-SA', name: 'Arabic (Saudi Arabia)' },
    { code: 'hi-IN', name: 'Hindi (India)' },
    { code: 'nl-NL', name: 'Dutch (Netherlands)' },
  ];

  /**
   * Get common locale options (subset for better UX)
   */
  public getCommonLocales(): LocaleOption[] {
    return this.commonLocaleOptions;
  }

  /**
   * Get all available locales
   * Uses Intl.supportedValuesOf to get all available locales
   */
  public getAllLocales(): LocaleOption[] {
    try {
      // TODO: Remove 'as any' when migrating to ES2023 - 'language' will be properly typed
      const languages = Intl.supportedValuesOf('language' as any);
      const locales = Intl.getCanonicalLocales(languages);

      return locales.map((locale) => ({
        code: locale,
        name: this.getLocaleName(locale),
      }));
    } catch {
      // Fallback to common locales if supportedValuesOf is not available
      return this.commonLocaleOptions;
    }
  }

  /**
   * Get display name for a locale
   */
  private getLocaleName(locale: string): string {
    try {
      const displayNames = new Intl.DisplayNames([locale], { type: 'language' });
      return displayNames.of(locale) || locale;
    } catch {
      return locale;
    }
  }

  /**
   * Detect user's timezone using Intl API
   */
  private detectTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'UTC';
    }
  }

  /**
   * Detect user's locale using Intl API
   */
  private detectLocale(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().locale;
    } catch {
      return 'en-US';
    }
  }

  /**
   * Get common timezones (subset for better UX)
   */
  public getCommonTimezones(): TimezoneOption[] {
    const now = new Date();
    const commonZones = [
      'America/New_York',
      'America/Chicago',
      'America/Denver',
      'America/Los_Angeles',
      'America/Anchorage',
      'Pacific/Honolulu',
      'America/Toronto',
      'America/Vancouver',
      'America/Mexico_City',
      'America/Sao_Paulo',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Rome',
      'Europe/Madrid',
      'Europe/Moscow',
      'Africa/Cairo',
      'Africa/Johannesburg',
      'Asia/Dubai',
      'Asia/Kolkata',
      'Asia/Shanghai',
      'Asia/Tokyo',
      'Asia/Seoul',
      'Asia/Singapore',
      'Australia/Sydney',
      'Australia/Melbourne',
      'Pacific/Auckland',
      'UTC',
    ];

    return commonZones.map((tz) => ({
      value: tz,
      label: tz.replace(/_/g, ' '),
      offset: this.getTimezoneOffset(tz, now),
    }));
  }

  /**
   * Get all IANA timezones (full list)
   * Uses Intl.supportedValuesOf to get all available timezones
   */
  public getAllTimezones(): TimezoneOption[] {
    try {
      const now = new Date();
      const allZones = Intl.supportedValuesOf('timeZone');

      return allZones.map((tz) => ({
        value: tz,
        label: tz.replace(/_/g, ' '),
        offset: this.getTimezoneOffset(tz, now),
      }));
    } catch {
      // Fallback to common timezones if supportedValuesOf is not available
      return this.getCommonTimezones();
    }
  }

  /**
   * Get timezone offset string (e.g., 'UTC-7', 'UTC+1')
   */
  public getTimezoneOffset(timezone: string, date: Date = new Date()): string {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'shortOffset',
      });
      const parts = formatter.formatToParts(date);
      const offsetPart = parts.find((part) => part.type === 'timeZoneName');
      return offsetPart?.value || 'UTC';
    } catch {
      return 'UTC';
    }
  }

  /**
   * Set user's timezone preference
   */
  public setTimezone(timezone: string): void {
    this.timezone.set(timezone);
  }

  /**
   * Set user's locale preference
   */
  public setLocale(locale: string): void {
    this.locale.set(locale);
  }

  /**
   * Set user's date format preference
   */
  public setDateFormat(format: DateFormat): void {
    this.dateFormat.set(format);
  }
}
