import { ChangeDetectionStrategy, Component, input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { sanitizeHtml } from '@ttrpg-ui/features/sprint-management/util';

@Component({
  selector: 'lib-shared-notification',
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './shared-notification.component.html',
  styleUrl: './shared-notification.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SharedNotificationComponent {
  private readonly sanitizer = inject(DomSanitizer);

  title = input<string | undefined>();

  description = input<string | undefined>();

  descriptionHtml = input<string | undefined>();

  descriptionJson = input<object | undefined>();

  icon = input<string | undefined>();

  color = input<'primary' | 'error' | undefined>();

  /**
   * Sanitized HTML content for safe rendering
   * Requirement 30.8: Sanitize user input to prevent XSS attacks
   * Requirement 30.10: Use Angular's built-in sanitization for dynamic content
   */
  sanitizedDescriptionHtml = computed(() => {
    const html = this.descriptionHtml();
    return html ? sanitizeHtml(html, this.sanitizer) : undefined;
  });
}
