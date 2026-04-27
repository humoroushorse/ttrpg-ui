import { SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

export function sanitizeHtml(content: string, sanitizer: DomSanitizer): string {
  if (!content) {
    return '';
  }

  const sanitized = sanitizer.sanitize(SecurityContext.HTML, content);
  return sanitized || '';
}

export function sanitizeMarkdown(markdown: string, sanitizer: DomSanitizer): string {
  if (!markdown) {
    return '';
  }

  const sanitized = sanitizer.sanitize(SecurityContext.HTML, markdown);
  return sanitized || '';
}

export function sanitizeUrl(url: string, sanitizer: DomSanitizer): string {
  if (!url) {
    return '';
  }

  const sanitized = sanitizer.sanitize(SecurityContext.URL, url);
  return sanitized || '';
}

export function sanitizeResourceUrl(url: string, sanitizer: DomSanitizer): string {
  if (!url) {
    return '';
  }

  const sanitized = sanitizer.sanitize(SecurityContext.RESOURCE_URL, url);
  return sanitized || '';
}

export function sanitizeStyle(style: string, sanitizer: DomSanitizer): string {
  if (!style) {
    return '';
  }

  const sanitized = sanitizer.sanitize(SecurityContext.STYLE, style);
  return sanitized || '';
}

export function sanitizeApiResponse<T extends Record<string, any>>(
  data: T,
  sanitizer: DomSanitizer,
  fieldsToSanitize: (keyof T)[]
): T {
  if (!data) {
    return data;
  }

  const sanitized = { ...data };

  for (const field of fieldsToSanitize) {
    const value = sanitized[field];
    if (typeof value === 'string') {
      sanitized[field] = sanitizeHtml(value, sanitizer) as T[keyof T];
    }
  }

  return sanitized;
}
