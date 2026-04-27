/**
 * Shared Date Pipe
 * Wraps Angular DatePipe with timezone and locale awareness
 */

import { Pipe, PipeTransform, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SharedDateService } from '@ttrpg-ui/shared/date/data-access';

@Pipe({
  name: 'sharedDate',
  standalone: true,
})
export class SharedDatePipe implements PipeTransform {
  private readonly dateService = inject(SharedDateService);
  private readonly datePipe = new DatePipe('en-US');

  /**
   * Transform a date using the user's timezone, locale, and format preferences
   * @param value Date to format
   * @param format Optional format override (uses service default if not provided)
   * @param timezone Optional timezone override (uses service default if not provided)
   * @param locale Optional locale override (uses service default if not provided)
   */
  transform(
    value: Date | string | number | null | undefined,
    format?: string,
    timezone?: string,
    locale?: string,
  ): string | null {
    if (!value) {
      return null;
    }

    const finalFormat = format || this.dateService.dateFormat();
    const finalTimezone = timezone || this.dateService.timezone();
    const finalLocale = locale || this.dateService.locale();

    // Create a new DatePipe with the user's locale
    const localizedPipe = new DatePipe(finalLocale);

    return localizedPipe.transform(value, finalFormat, finalTimezone);
  }
}
