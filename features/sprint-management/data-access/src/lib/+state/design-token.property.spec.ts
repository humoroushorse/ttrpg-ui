/**
 * Property-Based Tests: Design Token & Code Standards
 *
 * **Validates: Requirements 9.3, 9.4, 11.1, 11.7, 12.1, 12.2**
 * Property 7: No Tailwind color/typography classes in templates.
 * Property 8: Design token usage — no hardcoded colors.
 * Property 11: No requirement reference comments.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

const TAILWIND_COLOR_PATTERN =
  /\b(text|bg|border|ring|shadow|fill|stroke)-(red|blue|green|yellow|purple|pink|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose|white|black|inherit|current|transparent)-\d+/;

const TAILWIND_TYPOGRAPHY_PATTERN =
  /\b(text-(xs|sm|base|lg|xl|2xl|3xl)|font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black))\b/;

function hasTailwindViolation(htmlContent: string): boolean {
  return TAILWIND_COLOR_PATTERN.test(htmlContent) || TAILWIND_TYPOGRAPHY_PATTERN.test(htmlContent);
}

const HARDCODED_HEX_PATTERN = /(?<!--[\w-]+\s*:\s*)#[0-9a-fA-F]{3,8}\b/;
const HARDCODED_RGB_PATTERN = /(?<!var\()rgba?\(/;

function hasHardcodedColor(scssContent: string): boolean {
  return HARDCODED_HEX_PATTERN.test(scssContent) || HARDCODED_RGB_PATTERN.test(scssContent);
}

const REQUIREMENT_COMMENT_SINGLE = /\/\/.*\b(Requirement|Req)\s+\d+\.\d+/i;
const REQUIREMENT_COMMENT_BLOCK = /\/\*[\s\S]*?\b(Requirement|Req)\s+\d+\.\d+[\s\S]*?\*\//i;

function hasRequirementComment(code: string): boolean {
  return REQUIREMENT_COMMENT_SINGLE.test(code) || REQUIREMENT_COMMENT_BLOCK.test(code);
}

// ============================================================================
// Property 7: No Tailwind color/typography classes
// ============================================================================

describe('Property 7: No Tailwind color/typography classes in templates', () => {
  it('clean HTML with no Tailwind color or typography classes returns false', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom(
            '<div class="flex items-center gap-4">',
            '<span class="mat-body-1">',
            '<button mat-raised-button>',
            '<div class="container mx-auto">',
            '<p class="description">',
            '<div class="grid grid-cols-3">',
          ),
          { minLength: 1, maxLength: 5 }
        ),
        (htmlParts) => {
          const html = htmlParts.join('\n');
          expect(hasTailwindViolation(html)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('HTML with Tailwind color classes returns true', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'text-red-500',
          'bg-blue-200',
          'border-gray-300',
          'ring-purple-400',
          'shadow-slate-100',
          'fill-emerald-600',
          'stroke-rose-700',
          'text-white-500',
          'bg-black-100',
        ),
        fc.string({ maxLength: 20 }),
        (colorClass, prefix) => {
          const html = `<div class="${prefix} ${colorClass}">content</div>`;
          expect(hasTailwindViolation(html)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('HTML with Tailwind typography classes returns true', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'text-xs',
          'text-sm',
          'text-base',
          'text-lg',
          'text-xl',
          'text-2xl',
          'text-3xl',
          'font-thin',
          'font-bold',
          'font-semibold',
          'font-medium',
          'font-normal',
        ),
        (typographyClass) => {
          const html = `<span class="${typographyClass}">text</span>`;
          expect(hasTailwindViolation(html)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 8: Design token usage — no hardcoded colors
// ============================================================================

describe('Property 8: Design token usage — no hardcoded colors in SCSS', () => {
  it('SCSS using var(--g-color-*) tokens returns false', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom(
            'color: var(--g-color-primary);',
            'background: var(--g-color-surface);',
            'border-color: var(--g-color-secondary);',
            'fill: var(--g-color-on-primary);',
            '--g-color-primary: #6750a4;',
          ),
          { minLength: 1, maxLength: 5 }
        ),
        (scssParts) => {
          const scss = `.component {\n  ${scssParts.join('\n  ')}\n}`;
          expect(hasHardcodedColor(scss)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('SCSS with hardcoded hex colors returns true', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          '#757575',
          '#ff0000',
          '#abc',
          '#1a2b3c',
          '#ffffff',
          '#000000ff',
        ),
        (hexColor) => {
          const scss = `.component { color: ${hexColor}; }`;
          expect(hasHardcodedColor(scss)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('SCSS with hardcoded rgb/rgba colors returns true', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'rgb(117, 117, 117)',
          'rgba(0, 0, 0, 0.5)',
          'rgb(255, 0, 0)',
          'rgba(100, 200, 50, 1)',
        ),
        (rgbColor) => {
          const scss = `.component { color: ${rgbColor}; }`;
          expect(hasHardcodedColor(scss)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ============================================================================
// Property 11: No requirement reference comments
// ============================================================================

describe('Property 11: No requirement reference comments in code', () => {
  it('clean code with no requirement references returns false', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom(
            '// This function handles user authentication',
            '// Returns the filtered list of items',
            '/* Component for displaying work items */',
            '// TODO: add error handling',
            '// NOTE: this is intentional',
            'const x = 1; // inline comment',
          ),
          { minLength: 1, maxLength: 5 }
        ),
        (codeParts) => {
          const code = codeParts.join('\n');
          expect(hasRequirementComment(code)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('code with "Requirement X.Y" single-line comments returns true', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.integer({ min: 1, max: 20 }),
        (major, minor) => {
          const code = `// Requirement ${major}.${minor}: some description`;
          expect(hasRequirementComment(code)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('code with "Req X.Y" single-line comments returns true', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.integer({ min: 1, max: 20 }),
        (major, minor) => {
          const code = `// Req ${major}.${minor}: some description`;
          expect(hasRequirementComment(code)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('code with normal comments (no requirement references) returns false', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter(
          (s) =>
            !/\b(Requirement|Req)\s+\d+\.\d+/i.test(s) &&
            !s.includes('//') &&
            !s.includes('/*')
        ),
        (commentText) => {
          const code = `// ${commentText}`;
          expect(hasRequirementComment(code)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('code with block comments containing requirement references returns true', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.integer({ min: 1, max: 20 }),
        (major, minor) => {
          const code = `/* Requirement ${major}.${minor}: some description */`;
          expect(hasRequirementComment(code)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
