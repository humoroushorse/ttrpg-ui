import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { FormControl, Validators } from '@angular/forms';

/**
 * Property-Based Tests for Comment Content Validation
 * These tests validate that comment content validation works correctly
 */
describe('CommentFormComponent - Comment Validation Property Tests', () => {
  /**
   * Custom validator to ensure content is not empty or whitespace only
   * This replicates the validator from CommentFormComponent
   */
  function notEmptyValidator(
    control: FormControl<string>
  ): Record<string, unknown> | null {
    const value = control.value || '';
    if (value.trim().length === 0) {
      return { empty: true };
    }
    return null;
  }

  /**
   * Feature: sprint-management-app, Property 12: Comment Content Validation
   * For any comment creation request, if content is empty or contains only whitespace,
   * validation should fail with an appropriate error message.
   */
  it('should reject empty or whitespace-only content for any input', () => {
    fc.assert(
      fc.property(
        // Generate strings that are either empty or contain only whitespace
        fc.oneof(
          fc.constant(''), // Empty string
          fc.string({ minLength: 1, maxLength: 50 }).map((s) => ' '.repeat(s.length)), // Only spaces
          fc.string({ minLength: 1, maxLength: 50 }).map((s) => '\t'.repeat(s.length)), // Only tabs
          fc.string({ minLength: 1, maxLength: 50 }).map((s) => '\n'.repeat(s.length)), // Only newlines
          fc
            .array(fc.constantFrom(' ', '\t', '\n', '\r'), {
              minLength: 1,
              maxLength: 50,
            })
            .map((chars) => chars.join('')) // Mixed whitespace
        ),
        (content: string) => {
          // Create a form control with the validators
          const control = new FormControl<string>(content, {
            nonNullable: true,
            validators: [Validators.required, notEmptyValidator],
          });

          // Trigger validation
          control.markAsTouched();
          control.updateValueAndValidity();

          // Property 1: Control should be invalid
          expect(control.invalid).toBe(true);

          // Property 2: Control should have either 'required' or 'empty' error
          const hasRequiredError = control.hasError('required');
          const hasEmptyError = control.hasError('empty');
          expect(hasRequiredError || hasEmptyError).toBe(true);

          // Property 3: Trimmed content should be empty
          expect(content.trim()).toBe('');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Valid content (non-empty, non-whitespace) should pass validation
   */
  it('should accept valid content with non-whitespace characters', () => {
    fc.assert(
      fc.property(
        // Generate strings that contain at least one non-whitespace character
        fc
          .string({ minLength: 1, maxLength: 500 })
          .filter((s) => s.trim().length > 0),
        (content: string) => {
          // Create a form control with the validators
          const control = new FormControl<string>(content, {
            nonNullable: true,
            validators: [Validators.required, notEmptyValidator],
          });

          // Trigger validation
          control.markAsTouched();
          control.updateValueAndValidity();

          // Property 1: Control should be valid
          expect(control.valid).toBe(true);

          // Property 2: Control should not have 'required' error
          expect(control.hasError('required')).toBe(false);

          // Property 3: Control should not have 'empty' error
          expect(control.hasError('empty')).toBe(false);

          // Property 4: Trimmed content should not be empty
          expect(content.trim().length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Content with leading/trailing whitespace but valid content should pass
   */
  it('should accept content with leading/trailing whitespace if it contains valid text', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.string({ minLength: 0, maxLength: 20 }).map((s) => ' '.repeat(s.length)), // Leading whitespace
          fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0), // Valid content
          fc.string({ minLength: 0, maxLength: 20 }).map((s) => ' '.repeat(s.length)) // Trailing whitespace
        ),
        ([leading, content, trailing]) => {
          const fullContent = leading + content + trailing;

          // Create a form control with the validators
          const control = new FormControl<string>(fullContent, {
            nonNullable: true,
            validators: [Validators.required, notEmptyValidator],
          });

          // Trigger validation
          control.markAsTouched();
          control.updateValueAndValidity();

          // Property 1: Control should be valid (has non-whitespace content)
          expect(control.valid).toBe(true);

          // Property 2: Trimmed content should equal the original content
          expect(fullContent.trim()).toBe(content.trim());

          // Property 3: Trimmed content should not be empty
          expect(fullContent.trim().length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Edge case: Very long valid content should pass validation
   */
  it('should accept very long valid content', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1000, maxLength: 5000 }).filter((s) => s.trim().length > 0),
        (content: string) => {
          const control = new FormControl<string>(content, {
            nonNullable: true,
            validators: [Validators.required, notEmptyValidator],
          });

          control.markAsTouched();
          control.updateValueAndValidity();

          expect(control.valid).toBe(true);
          expect(content.trim().length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Edge case: Content with special characters and markdown should pass validation
   */
  it('should accept content with special characters and markdown syntax', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant('**bold text**'),
          // eslint-disable-next-line ttrpg-custom/no-tailwind-typography
          fc.constant('*italic text*'),
          fc.constant('`code block`'),
          fc.constant('[link](https://example.com)'),
          fc.constant('> blockquote'),
          fc.constant('- list item'),
          fc.constant('# Heading'),
          fc.constant('```\ncode\n```'),
          fc.string({ minLength: 1, maxLength: 100 }).map((s) => `**${s}**`),
          fc.string({ minLength: 1, maxLength: 100 }).map((s) => `*${s}*`),
          fc.string({ minLength: 1, maxLength: 100 }).map((s) => `\`${s}\``)
        ),
        (content: string) => {
          const control = new FormControl<string>(content, {
            nonNullable: true,
            validators: [Validators.required, notEmptyValidator],
          });

          control.markAsTouched();
          control.updateValueAndValidity();

          // Property: Markdown content should be valid
          expect(control.valid).toBe(true);
          expect(content.trim().length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Edge case: Single character should pass validation
   */
  it('should accept single character content', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 1 }).filter((c) => c.trim().length > 0),
        (char: string) => {
          const control = new FormControl<string>(char, {
            nonNullable: true,
            validators: [Validators.required, notEmptyValidator],
          });

          control.markAsTouched();
          control.updateValueAndValidity();

          expect(control.valid).toBe(true);
          expect(char.trim().length).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Validation should be consistent across multiple checks
   */
  it('should produce consistent validation results for the same input', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 100 }),
        (content: string) => {
          // Create two controls with the same content
          const control1 = new FormControl<string>(content, {
            nonNullable: true,
            validators: [Validators.required, notEmptyValidator],
          });

          const control2 = new FormControl<string>(content, {
            nonNullable: true,
            validators: [Validators.required, notEmptyValidator],
          });

          // Trigger validation on both
          control1.markAsTouched();
          control1.updateValueAndValidity();
          control2.markAsTouched();
          control2.updateValueAndValidity();

          // Property: Both controls should have the same validity
          expect(control1.valid).toBe(control2.valid);
          expect(control1.invalid).toBe(control2.invalid);

          // Property: Both controls should have the same errors
          expect(control1.errors).toEqual(control2.errors);
        }
      ),
      { numRuns: 100 }
    );
  });
});
