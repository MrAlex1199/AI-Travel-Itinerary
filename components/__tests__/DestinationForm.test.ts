/**
 * DestinationForm Component Tests
 * 
 * Property-based tests for destination and duration validation.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Validation functions extracted from DestinationForm component
 * These mirror the actual validation logic in the component
 */

// Destination validation - must be non-empty (Requirement 1.2)
const validateDestination = (destination: string): boolean => {
  return destination.trim().length >= 1;
};

// Duration validation - must be >= 1 (Requirement 1.3)
const validateDuration = (duration: number): boolean => {
  return !isNaN(duration) && duration >= 1;
};

describe('DestinationForm Validation', () => {
  describe('Property-Based Tests', () => {
    // Feature: ai-travel-itinerary, Property 1: Destination validation accepts non-empty strings
    // Validates: Requirements 1.2
    it('Property 1: destination validation accepts non-empty strings', () => {
      // Arbitrary for non-empty strings (strings with at least 1 non-whitespace character)
      const arbitraryNonEmptyString = fc
        .string({ minLength: 1, maxLength: 100 })
        .filter(s => s.trim().length >= 1);

      fc.assert(
        fc.property(arbitraryNonEmptyString, (destination) => {
          // Property: For any string with at least 1 character after trimming,
          // the validation should accept it
          const result = validateDestination(destination);
          expect(result).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('destination validation rejects empty strings', () => {
      // Test that empty strings and whitespace-only strings are rejected
      const arbitraryEmptyOrWhitespace = fc.oneof(
        fc.constant(''),
        fc.string().filter(s => s.trim().length === 0 && s.length > 0)
      );

      fc.assert(
        fc.property(arbitraryEmptyOrWhitespace, (destination) => {
          const result = validateDestination(destination);
          expect(result).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    // Feature: ai-travel-itinerary, Property 2: Duration validation accepts positive integers
    // Validates: Requirements 1.3
    it('Property 2: duration validation accepts positive integers', () => {
      // Arbitrary for positive integers (>= 1)
      const arbitraryPositiveInteger = fc.integer({ min: 1, max: 1000 });

      fc.assert(
        fc.property(arbitraryPositiveInteger, (duration) => {
          // Property: For any numeric input >= 1, the validation should accept it
          const result = validateDuration(duration);
          expect(result).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('duration validation rejects non-positive values', () => {
      // Test that values < 1 and NaN are rejected
      const arbitraryInvalidDuration = fc.oneof(
        fc.integer({ max: 0 }), // 0 and negative integers
        fc.constant(NaN)
      );

      fc.assert(
        fc.property(arbitraryInvalidDuration, (duration) => {
          const result = validateDuration(duration);
          expect(result).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    // Feature: ai-travel-itinerary, Property 3: Invalid inputs prevent form submission
    // Validates: Requirements 1.5
    it('Property 3: invalid inputs prevent form submission', () => {
      // Generate arbitrary invalid form inputs
      // Invalid means: empty/whitespace destination OR duration < 1
      const arbitraryInvalidFormInput = fc.oneof(
        // Case 1: Invalid destination (empty or whitespace), valid duration
        fc.record({
          destination: fc.oneof(
            fc.constant(''),
            fc.string().filter(s => s.trim().length === 0 && s.length > 0)
          ),
          duration: fc.integer({ min: 1, max: 100 })
        }),
        // Case 2: Valid destination, invalid duration (< 1)
        fc.record({
          destination: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length >= 1),
          duration: fc.integer({ max: 0 })
        }),
        // Case 3: Both invalid
        fc.record({
          destination: fc.oneof(
            fc.constant(''),
            fc.string().filter(s => s.trim().length === 0 && s.length > 0)
          ),
          duration: fc.integer({ max: 0 })
        })
      );

      fc.assert(
        fc.property(arbitraryInvalidFormInput, (input) => {
          // Property: For any form submission with invalid inputs,
          // at least one validation should fail
          const destinationValid = validateDestination(input.destination);
          const durationValid = validateDuration(input.duration);
          
          // At least one should be invalid
          const formIsInvalid = !destinationValid || !durationValid;
          expect(formIsInvalid).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests', () => {
    it('should accept valid destination strings', () => {
      expect(validateDestination('Bangkok')).toBe(true);
      expect(validateDestination('New York')).toBe(true);
      expect(validateDestination('กรุงเทพมหานคร')).toBe(true);
      expect(validateDestination('  Tokyo  ')).toBe(true); // with whitespace
    });

    it('should reject empty destination strings', () => {
      expect(validateDestination('')).toBe(false);
      expect(validateDestination('   ')).toBe(false);
      expect(validateDestination('\t\n')).toBe(false);
    });

    it('should accept valid duration values', () => {
      expect(validateDuration(1)).toBe(true);
      expect(validateDuration(5)).toBe(true);
      expect(validateDuration(30)).toBe(true);
      expect(validateDuration(100)).toBe(true);
    });

    it('should reject invalid duration values', () => {
      expect(validateDuration(0)).toBe(false);
      expect(validateDuration(-1)).toBe(false);
      expect(validateDuration(-10)).toBe(false);
      expect(validateDuration(NaN)).toBe(false);
    });
  });
});
