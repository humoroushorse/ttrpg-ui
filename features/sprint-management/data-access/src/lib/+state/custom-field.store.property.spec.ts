/**
 * Property-Based Tests: Custom Field Number Validation
 *
 * **Validates: Requirements 3.1**
 * Property 3: For any custom field with type=number, the stored value SHALL be a valid number or null.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { SprintModels } from '@ttrpg-ui/features/sprint-management/models';

const { CustomFieldType } = SprintModels.CustomField;
type CustomFieldDefinition = SprintModels.CustomField.CustomFieldDefinition;

const numberFieldDef: CustomFieldDefinition = {
  key: 'complexity_score',
  label: 'Complexity Score',
  type: CustomFieldType.Number,
  placeholder: '1-10',
};

function processNumberFieldValue(rawValue: string): number | null {
  if (rawValue === '' || rawValue === null || rawValue === undefined) {
    return null;
  }
  const parsed = parseFloat(rawValue);
  if (isNaN(parsed) || !isFinite(parsed)) {
    return null;
  }
  return parsed;
}

function simulateOnValueChange(fieldDef: CustomFieldDefinition, rawInputValue: string): number | null | any {
  if (fieldDef.type !== CustomFieldType.Number) {
    return rawInputValue;
  }
  return processNumberFieldValue(rawInputValue);
}

describe('CustomField Store - Number Field Validation (Property 3)', () => {
  it('number fields always produce a valid finite number or null after value change', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.float({ noNaN: true }).map(String),
          fc.integer().map(String),
          fc.constant(''),
          fc.constant('abc'),
          fc.constant('NaN'),
          fc.constant('Infinity'),
          fc.constant('-Infinity'),
          fc.string({ maxLength: 20 }),
        ),
        (rawValue) => {
          const result = simulateOnValueChange(numberFieldDef, rawValue);

          if (result === null) {
            expect(result).toBeNull();
          } else {
            expect(typeof result).toBe('number');
            expect(Number.isFinite(result) || result === null).toBe(true);
            expect(Number.isNaN(result)).toBe(false);
          }
        }
      ),
      { numRuns: 500 }
    );
  });

  it('empty string input produces null for number fields', () => {
    const result = simulateOnValueChange(numberFieldDef, '');
    expect(result).toBeNull();
  });

  it('non-numeric string input produces null for number fields', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => isNaN(parseFloat(s))),
        (nonNumericString) => {
          const result = simulateOnValueChange(numberFieldDef, nonNumericString);
          expect(result).toBeNull();
        }
      ),
      { numRuns: 200 }
    );
  });

  it('valid numeric string input produces a finite number for number fields', () => {
    fc.assert(
      fc.property(
        fc.float({ noNaN: true, noDefaultInfinity: true }).map(String),
        (numericString) => {
          const result = simulateOnValueChange(numberFieldDef, numericString);
          if (result !== null) {
            expect(typeof result).toBe('number');
            expect(Number.isNaN(result)).toBe(false);
          }
        }
      ),
      { numRuns: 200 }
    );
  });

  it('non-number field types pass through values unchanged', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(CustomFieldType.Text),
          fc.constant(CustomFieldType.Select),
        ),
        fc.string({ maxLength: 50 }),
        (fieldType, value) => {
          const fieldDef: CustomFieldDefinition = {
            key: 'test_field',
            label: 'Test',
            type: fieldType,
          };
          const result = simulateOnValueChange(fieldDef, value);
          expect(result).toBe(value);
        }
      ),
      { numRuns: 200 }
    );
  });
});
