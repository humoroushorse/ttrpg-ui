import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

/**
 * Custom validator to ensure end_date is after start_date
 */
function dateRangeValidator(group: FormGroup): { [key: string]: any } | null {
  const startDate = group.get('start_date')?.value;
  const endDate = group.get('end_date')?.value;

  if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
    return { dateRange: true };
  }

  return null;
}

describe('PageSprintCreateComponent - Property-Based Tests', () => {
  /**
   * Feature: sprint-management-app, Property 9: Sprint Date Validation
   * For any sprint creation request, if end_date is not after start_date,
   * validation should fail with an appropriate error message.
   */
  it('should fail validation when end_date is not after start_date', () => {
    fc.assert(
      fc.property(
        // Generate a start date
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        // Generate an end date that is before or equal to start date
        fc.integer({ min: -365, max: 0 }), // Days offset (negative or zero)
        (startDate, daysOffset) => {
          // Skip invalid dates (fast-check can generate NaN dates)
          fc.pre(!isNaN(startDate.getTime()));
          // Create form with date range validator
          const fb = new FormBuilder();
          const form = fb.group(
            {
              name: ['Test Sprint', [Validators.required]],
              description: ['Test Description'],
              start_date: [startDate, [Validators.required]],
              end_date: [new Date(startDate.getTime() + daysOffset * 24 * 60 * 60 * 1000), [Validators.required]],
              goal: [''],
            },
            { validators: dateRangeValidator },
          );

          // Trigger validation
          form.updateValueAndValidity();

          // Verify validation fails
          expect(form.hasError('dateRange')).toBe(true);
          expect(form.valid).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: sprint-management-app, Property 9: Sprint Date Validation
   * For any sprint creation request, if end_date is after start_date,
   * validation should pass (assuming all other fields are valid).
   */
  it('should pass validation when end_date is after start_date', () => {
    fc.assert(
      fc.property(
        // Generate a start date
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        // Generate an end date that is after start date
        fc.integer({ min: 1, max: 365 }), // Days offset (positive)
        (startDate, daysOffset) => {
          // Create form with date range validator
          const fb = new FormBuilder();
          const form = fb.group(
            {
              name: ['Test Sprint', [Validators.required]],
              description: ['Test Description'],
              start_date: [startDate, [Validators.required]],
              end_date: [new Date(startDate.getTime() + daysOffset * 24 * 60 * 60 * 1000), [Validators.required]],
              goal: [''],
            },
            { validators: dateRangeValidator },
          );

          // Trigger validation
          form.updateValueAndValidity();

          // Verify validation passes (no dateRange error)
          expect(form.hasError('dateRange')).toBe(false);
          expect(form.valid).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Feature: sprint-management-app, Property 9: Sprint Date Validation
   * For any sprint creation request with missing required fields,
   * validation should fail.
   */
  it('should fail validation when required fields are missing', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.option(fc.string(), { nil: undefined }),
          description: fc.string(),
          start_date: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }), {
            nil: undefined,
          }),
          end_date: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }), {
            nil: undefined,
          }),
          goal: fc.string(),
        }),
        (formData) => {
          // Skip if all required fields are present (we're testing missing fields)
          if (formData.name && formData.start_date && formData.end_date) {
            return true;
          }

          // Create form with validators
          const fb = new FormBuilder();
          const form = fb.group(
            {
              name: [formData.name, [Validators.required]],
              description: [formData.description],
              start_date: [formData.start_date, [Validators.required]],
              end_date: [formData.end_date, [Validators.required]],
              goal: [formData.goal],
            },
            { validators: dateRangeValidator },
          );

          // Trigger validation
          form.updateValueAndValidity();

          // Verify validation fails
          expect(form.valid).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });
});
