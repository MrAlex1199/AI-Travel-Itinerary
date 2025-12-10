import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  t,
  formatDate,
  formatDateTime,
  formatTime,
  formatRelativeTime,
  formatDuration,
  getValidationError,
  getAuthError,
  getErrorMessage,
  th,
} from '../index';

describe('Localization System', () => {
  describe('t() - Translation function', () => {
    it('should return correct Thai translation for valid key', () => {
      expect(t('common.loading')).toBe('กำลังโหลด...');
      expect(t('auth.loginTitle')).toBe('เข้าสู่ระบบ');
      expect(t('navigation.home')).toBe('หน้าแรก');
    });

    it('should return key path for invalid key', () => {
      expect(t('invalid.key.path')).toBe('invalid.key.path');
    });

    it('should handle nested keys correctly', () => {
      expect(t('destinationForm.title')).toBe('สร้างแผนการเดินทางของคุณ');
      expect(t('validation.destinationRequired')).toBe('กรุณากรอกจุดหมายปลายทาง');
    });
  });

  describe('formatDate()', () => {
    it('should format date in Thai locale', () => {
      const date = new Date('2024-12-09');
      const formatted = formatDate(date);
      expect(formatted).toContain('ธันวาคม');
      expect(formatted).toContain('9');
    });

    it('should accept string date input', () => {
      const formatted = formatDate('2024-12-09');
      expect(formatted).toContain('ธันวาคม');
    });
  });

  describe('formatDateTime()', () => {
    it('should format date and time in Thai locale', () => {
      const date = new Date('2024-12-09T14:30:00');
      const formatted = formatDateTime(date);
      expect(formatted).toContain('ธันวาคม');
      expect(formatted).toContain('14:30');
    });
  });

  describe('formatTime()', () => {
    it('should format time string in 24-hour format', () => {
      const formatted = formatTime('14:30');
      expect(formatted).toContain('14');
      expect(formatted).toContain('30');
    });

    it('should format Date object', () => {
      const date = new Date('2024-12-09T14:30:00');
      const formatted = formatTime(date);
      expect(formatted).toContain('14');
      expect(formatted).toContain('30');
    });

    it('should format time in 12-hour format when specified', () => {
      const formatted = formatTime('14:30', false);
      expect(formatted).toBeTruthy();
    });
  });

  describe('formatRelativeTime()', () => {
    it('should return "เมื่อสักครู่" for recent times', () => {
      const date = new Date(Date.now() - 30000); // 30 seconds ago
      expect(formatRelativeTime(date)).toBe('เมื่อสักครู่');
    });

    it('should return minutes for times within an hour', () => {
      const date = new Date(Date.now() - 1800000); // 30 minutes ago
      const formatted = formatRelativeTime(date);
      expect(formatted).toContain('นาทีที่แล้ว');
    });

    it('should return hours for times within a day', () => {
      const date = new Date(Date.now() - 7200000); // 2 hours ago
      const formatted = formatRelativeTime(date);
      expect(formatted).toContain('ชั่วโมงที่แล้ว');
    });

    it('should return days for times within a month', () => {
      const date = new Date(Date.now() - 172800000); // 2 days ago
      const formatted = formatRelativeTime(date);
      expect(formatted).toContain('วันที่แล้ว');
    });
  });

  describe('formatDuration()', () => {
    it('should format duration in Thai', () => {
      expect(formatDuration(1)).toBe('1 วัน');
      expect(formatDuration(5)).toBe('5 วัน');
      expect(formatDuration(10)).toBe('10 วัน');
    });
  });

  describe('getValidationError()', () => {
    it('should return correct validation error messages', () => {
      expect(getValidationError('required')).toBe('กรุณากรอกข้อมูลนี้');
      expect(getValidationError('destinationRequired')).toBe('กรุณากรอกจุดหมายปลายทาง');
      expect(getValidationError('durationMinimum')).toBe('กรุณากรอกจำนวนวันที่ถูกต้อง (ตั้งแต่ 1 วันขึ้นไป)');
    });
  });

  describe('getAuthError()', () => {
    it('should return correct authentication error messages', () => {
      expect(getAuthError('invalidCredentials')).toBe('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      expect(getAuthError('emailAlreadyExists')).toBe('อีเมลนี้ถูกใช้งานแล้ว');
      expect(getAuthError('sessionExpired')).toBe('เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง');
    });
  });

  describe('getErrorMessage()', () => {
    it('should return correct general error messages', () => {
      expect(getErrorMessage('generic')).toBe('เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
      expect(getErrorMessage('networkError')).toBe('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาตรวจสอบอินเทอร์เน็ตของคุณ');
      expect(getErrorMessage('aiGenerationFailed')).toBe('การสร้างแผนการเดินทางล้มเหลว กรุณาลองอีกครั้ง');
    });
  });

  // Feature: ai-travel-itinerary, Property 23: UI elements are displayed in Thai
  describe('Property 23: UI elements are displayed in Thai', () => {
    /**
     * Helper function to check if a string contains Thai characters
     * Thai Unicode range: \u0E00-\u0E7F
     */
    const containsThaiCharacters = (text: string): boolean => {
      // Check if the string contains at least one Thai character
      const thaiRegex = /[\u0E00-\u0E7F]/;
      return thaiRegex.test(text);
    };

    /**
     * Helper function to recursively extract all string values from an object
     */
    const extractAllStrings = (obj: any, path: string = ''): string[] => {
      const strings: string[] = [];
      
      if (typeof obj === 'string') {
        strings.push(obj);
      } else if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          const newPath = path ? `${path}.${key}` : key;
          strings.push(...extractAllStrings(obj[key], newPath));
        }
      }
      
      return strings;
    };

    /**
     * Arbitrary generator for valid translation key paths
     */
    const arbitraryTranslationKey = (): fc.Arbitrary<string> => {
      // Extract all valid key paths from the translation object
      const validKeys: string[] = [];
      
      const extractKeys = (obj: any, prefix: string = '') => {
        for (const key in obj) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (typeof obj[key] === 'string') {
            validKeys.push(fullKey);
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            extractKeys(obj[key], fullKey);
          }
        }
      };
      
      extractKeys(th);
      
      return fc.constantFrom(...validKeys);
    };

    /**
     * Arbitrary generator for validation error types
     */
    const arbitraryValidationErrorType = (): fc.Arbitrary<Parameters<typeof getValidationError>[0]> => {
      return fc.constantFrom(
        'required',
        'invalidEmail',
        'invalidPassword',
        'destinationRequired',
        'durationRequired',
        'durationMinimum',
        'durationInvalid',
        'passwordTooShort',
        'passwordsDoNotMatch'
      );
    };

    /**
     * Arbitrary generator for authentication error types
     */
    const arbitraryAuthErrorType = (): fc.Arbitrary<Parameters<typeof getAuthError>[0]> => {
      return fc.constantFrom(
        'invalidCredentials',
        'emailAlreadyExists',
        'sessionExpired',
        'weakPassword',
        'passwordMismatch',
        'registrationFailed',
        'loginFailed',
        'logoutFailed',
        'authenticationRequired',
        'unauthorized'
      );
    };

    /**
     * Arbitrary generator for general error types
     */
    const arbitraryErrorType = (): fc.Arbitrary<Parameters<typeof getErrorMessage>[0]> => {
      return fc.constantFrom(
        'generic',
        'networkError',
        'serverError',
        'notFound',
        'timeout',
        'aiGenerationFailed',
        'aiTimeout',
        'aiRateLimit',
        'aiInvalidResponse',
        'databaseError',
        'saveFailed',
        'loadFailed'
      );
    };

    it('should display all translation keys in Thai', () => {
      fc.assert(
        fc.property(arbitraryTranslationKey(), (key) => {
          const translation = t(key);
          // The translation should contain Thai characters
          expect(containsThaiCharacters(translation)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should display all validation error messages in Thai', () => {
      fc.assert(
        fc.property(arbitraryValidationErrorType(), (errorType) => {
          const errorMessage = getValidationError(errorType);
          // The error message should contain Thai characters
          expect(containsThaiCharacters(errorMessage)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should display all authentication error messages in Thai', () => {
      fc.assert(
        fc.property(arbitraryAuthErrorType(), (errorType) => {
          const errorMessage = getAuthError(errorType);
          // The error message should contain Thai characters
          expect(containsThaiCharacters(errorMessage)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should display all general error messages in Thai', () => {
      fc.assert(
        fc.property(arbitraryErrorType(), (errorType) => {
          const errorMessage = getErrorMessage(errorType);
          // The error message should contain Thai characters
          expect(containsThaiCharacters(errorMessage)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should display duration formatting in Thai', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 365 }), (days) => {
          const formatted = formatDuration(days);
          // The formatted duration should contain Thai characters (วัน)
          expect(containsThaiCharacters(formatted)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should display relative time formatting in Thai', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), max: new Date() }),
          (date) => {
            const formatted = formatRelativeTime(date);
            // The formatted relative time should contain Thai characters
            expect(containsThaiCharacters(formatted)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should ensure all UI strings in translation object are in Thai', () => {
      // Extract all string values from the translation object
      const allStrings = extractAllStrings(th);
      
      // Verify that every string contains Thai characters
      allStrings.forEach((str) => {
        expect(containsThaiCharacters(str)).toBe(true);
      });
      
      // Ensure we have a reasonable number of strings
      expect(allStrings.length).toBeGreaterThan(50);
    });
  });

  // Feature: ai-travel-itinerary, Property 26: Authentication messages are in Thai
  describe('Property 26: Authentication messages are in Thai', () => {
    /**
     * Helper function to check if a string contains Thai characters
     * Thai Unicode range: \u0E00-\u0E7F
     */
    const containsThaiCharacters = (text: string): boolean => {
      const thaiRegex = /[\u0E00-\u0E7F]/;
      return thaiRegex.test(text);
    };

    /**
     * Arbitrary generator for all authentication error types
     */
    const arbitraryAuthErrorType = (): fc.Arbitrary<Parameters<typeof getAuthError>[0]> => {
      return fc.constantFrom(
        'invalidCredentials',
        'emailAlreadyExists',
        'sessionExpired',
        'weakPassword',
        'passwordMismatch',
        'registrationFailed',
        'loginFailed',
        'logoutFailed',
        'authenticationRequired',
        'unauthorized'
      );
    };

    /**
     * Arbitrary generator for authentication-related translation keys
     */
    const arbitraryAuthTranslationKey = (): fc.Arbitrary<string> => {
      const authKeys: string[] = [];
      
      // Extract all keys from the auth section
      for (const key in th.auth) {
        authKeys.push(`auth.${key}`);
      }
      
      return fc.constantFrom(...authKeys);
    };

    it('should display all authentication error messages in Thai', () => {
      fc.assert(
        fc.property(arbitraryAuthErrorType(), (errorType) => {
          const errorMessage = getAuthError(errorType);
          
          // The error message should be a non-empty string
          expect(errorMessage).toBeTruthy();
          expect(typeof errorMessage).toBe('string');
          expect(errorMessage.length).toBeGreaterThan(0);
          
          // The error message should contain Thai characters
          expect(containsThaiCharacters(errorMessage)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should display all authentication UI text in Thai', () => {
      fc.assert(
        fc.property(arbitraryAuthTranslationKey(), (key) => {
          const translation = t(key);
          
          // The translation should be a non-empty string
          expect(translation).toBeTruthy();
          expect(typeof translation).toBe('string');
          expect(translation.length).toBeGreaterThan(0);
          
          // The translation should contain Thai characters
          expect(containsThaiCharacters(translation)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should ensure authentication messages do not contain English keys', () => {
      fc.assert(
        fc.property(arbitraryAuthErrorType(), (errorType) => {
          const errorMessage = getAuthError(errorType);
          
          // The error message should not be the same as the error type key
          // (which would indicate a missing translation)
          expect(errorMessage).not.toBe(errorType);
          expect(errorMessage).not.toContain('auth.');
        }),
        { numRuns: 100 }
      );
    });

    it('should verify all authentication error types have Thai translations', () => {
      const authErrorTypes: Array<Parameters<typeof getAuthError>[0]> = [
        'invalidCredentials',
        'emailAlreadyExists',
        'sessionExpired',
        'weakPassword',
        'passwordMismatch',
        'registrationFailed',
        'loginFailed',
        'logoutFailed',
        'authenticationRequired',
        'unauthorized',
      ];

      authErrorTypes.forEach((errorType) => {
        const errorMessage = getAuthError(errorType);
        
        // Each authentication error should have a Thai translation
        expect(containsThaiCharacters(errorMessage)).toBe(true);
        expect(errorMessage).not.toBe(`auth.${errorType}`);
      });
    });

    it('should ensure authentication messages contain meaningful Thai text', () => {
      fc.assert(
        fc.property(arbitraryAuthErrorType(), (errorType) => {
          const errorMessage = getAuthError(errorType);
          
          // The error message should be reasonably long (not just a single character)
          expect(errorMessage.length).toBeGreaterThan(5);
          
          // The error message should contain Thai characters
          expect(containsThaiCharacters(errorMessage)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should verify authentication success messages are in Thai', () => {
      const successMessages = [
        t('auth.loginSuccess'),
        t('auth.logoutSuccess'),
        t('auth.registerSuccess'),
      ];

      successMessages.forEach((message) => {
        expect(containsThaiCharacters(message)).toBe(true);
        expect(message.length).toBeGreaterThan(0);
      });
    });

    it('should verify authentication form labels are in Thai', () => {
      const formLabels = [
        t('auth.loginTitle'),
        t('auth.registerTitle'),
        t('auth.email'),
        t('auth.password'),
        t('auth.confirmPassword'),
        t('auth.loginButton'),
        t('auth.registerButton'),
      ];

      formLabels.forEach((label) => {
        expect(containsThaiCharacters(label)).toBe(true);
        expect(label.length).toBeGreaterThan(0);
      });
    });

    it('should ensure all auth section strings are in Thai', () => {
      // Extract all string values from the auth section
      const authStrings: string[] = [];
      
      for (const key in th.auth) {
        const value = th.auth[key as keyof typeof th.auth];
        if (typeof value === 'string') {
          authStrings.push(value);
        }
      }
      
      // Verify that every string contains Thai characters
      authStrings.forEach((str) => {
        expect(containsThaiCharacters(str)).toBe(true);
      });
      
      // Ensure we have a reasonable number of auth strings
      expect(authStrings.length).toBeGreaterThan(10);
    });
  });

  // Feature: ai-travel-itinerary, Property 25: Validation errors are in Thai
  describe('Property 25: Validation errors are in Thai', () => {
    /**
     * Helper function to check if a string contains Thai characters
     * Thai Unicode range: \u0E00-\u0E7F
     */
    const containsThaiCharacters = (text: string): boolean => {
      const thaiRegex = /[\u0E00-\u0E7F]/;
      return thaiRegex.test(text);
    };

    /**
     * Arbitrary generator for all validation error types
     */
    const arbitraryValidationErrorType = (): fc.Arbitrary<Parameters<typeof getValidationError>[0]> => {
      return fc.constantFrom(
        'required',
        'invalidEmail',
        'invalidPassword',
        'destinationRequired',
        'durationRequired',
        'durationMinimum',
        'durationInvalid',
        'passwordTooShort',
        'passwordsDoNotMatch'
      );
    };

    it('should display all validation errors in Thai language', () => {
      fc.assert(
        fc.property(arbitraryValidationErrorType(), (errorType) => {
          const errorMessage = getValidationError(errorType);
          
          // The error message should be a non-empty string
          expect(errorMessage).toBeTruthy();
          expect(typeof errorMessage).toBe('string');
          expect(errorMessage.length).toBeGreaterThan(0);
          
          // The error message should contain Thai characters
          expect(containsThaiCharacters(errorMessage)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should ensure validation error messages do not contain English error keys', () => {
      fc.assert(
        fc.property(arbitraryValidationErrorType(), (errorType) => {
          const errorMessage = getValidationError(errorType);
          
          // The error message should not be the same as the error type key
          // (which would indicate a missing translation)
          expect(errorMessage).not.toBe(errorType);
          expect(errorMessage).not.toContain('validation.');
        }),
        { numRuns: 100 }
      );
    });

    it('should verify all validation error types have Thai translations', () => {
      const validationErrorTypes: Array<Parameters<typeof getValidationError>[0]> = [
        'required',
        'invalidEmail',
        'invalidPassword',
        'destinationRequired',
        'durationRequired',
        'durationMinimum',
        'durationInvalid',
        'passwordTooShort',
        'passwordsDoNotMatch',
      ];

      validationErrorTypes.forEach((errorType) => {
        const errorMessage = getValidationError(errorType);
        
        // Each validation error should have a Thai translation
        expect(containsThaiCharacters(errorMessage)).toBe(true);
        expect(errorMessage).not.toBe(`validation.${errorType}`);
      });
    });

    it('should ensure validation errors contain meaningful Thai text', () => {
      fc.assert(
        fc.property(arbitraryValidationErrorType(), (errorType) => {
          const errorMessage = getValidationError(errorType);
          
          // The error message should be reasonably long (not just a single character)
          expect(errorMessage.length).toBeGreaterThan(5);
          
          // The error message should contain Thai characters
          expect(containsThaiCharacters(errorMessage)).toBe(true);
          
          // Common Thai words in validation messages
          const commonThaiValidationWords = ['กรุณา', 'ต้อง', 'ไม่', 'อย่างน้อย'];
          const containsCommonWord = commonThaiValidationWords.some(word => 
            errorMessage.includes(word)
          );
          
          // At least some validation messages should contain common Thai validation words
          // This is a soft check - not all messages need to contain these words
          if (errorType === 'required' || errorType === 'destinationRequired' || 
              errorType === 'durationRequired' || errorType === 'durationMinimum') {
            expect(containsCommonWord).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  // Feature: ai-travel-itinerary, Property 27: Dates use Thai locale formatting
  describe('Property 27: Dates use Thai locale formatting', () => {
    /**
     * Helper function to check if a string contains Thai characters
     * Thai Unicode range: \u0E00-\u0E7F
     */
    const containsThaiCharacters = (text: string): boolean => {
      const thaiRegex = /[\u0E00-\u0E7F]/;
      return thaiRegex.test(text);
    };

    /**
     * Helper function to verify Thai month names
     * Thai months: มกราคม, กุมภาพันธ์, มีนาคม, เมษายน, พฤษภาคม, มิถุนายน,
     *              กรกฎาคม, สิงหาคม, กันยายน, ตุลาคม, พฤศจิกายน, ธันวาคม
     */
    const thaiMonthNames = [
      'มกราคม',
      'กุมภาพันธ์',
      'มีนาคม',
      'เมษายน',
      'พฤษภาคม',
      'มิถุนายน',
      'กรกฎาคม',
      'สิงหาคม',
      'กันยายน',
      'ตุลาคม',
      'พฤศจิกายน',
      'ธันวาคม',
    ];

    /**
     * Helper function to check if formatted date contains a Thai month name
     */
    const containsThaiMonth = (text: string): boolean => {
      return thaiMonthNames.some(month => text.includes(month));
    };

    /**
     * Arbitrary generator for valid dates
     * Generates dates from year 2000 to 2100
     */
    const arbitraryDate = (): fc.Arbitrary<Date> => {
      return fc.date({
        min: new Date('2000-01-01'),
        max: new Date('2100-12-31'),
      });
    };

    /**
     * Arbitrary generator for date format options
     */
    const arbitraryDateFormatOptions = (): fc.Arbitrary<Intl.DateTimeFormatOptions> => {
      return fc.record({
        year: fc.constantFrom('numeric' as const, '2-digit' as const),
        month: fc.constantFrom('numeric' as const, '2-digit' as const, 'long' as const, 'short' as const),
        day: fc.constantFrom('numeric' as const, '2-digit' as const),
      });
    };

    it('should format all dates using Thai locale (th-TH)', () => {
      fc.assert(
        fc.property(arbitraryDate(), (date) => {
          const formatted = formatDate(date);
          
          // The formatted date should be a non-empty string
          expect(formatted).toBeTruthy();
          expect(typeof formatted).toBe('string');
          expect(formatted.length).toBeGreaterThan(0);
          
          // The formatted date should use Thai locale
          // This is verified by checking that it uses the same format as Intl.DateTimeFormat with 'th-TH'
          const expectedFormat = new Intl.DateTimeFormat('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }).format(date);
          
          expect(formatted).toBe(expectedFormat);
        }),
        { numRuns: 100 }
      );
    });

    it('should format dates with Thai month names when using long month format', () => {
      fc.assert(
        fc.property(arbitraryDate(), (date) => {
          const formatted = formatDate(date, { month: 'long' });
          
          // The formatted date should contain Thai characters
          expect(containsThaiCharacters(formatted)).toBe(true);
          
          // The formatted date should contain a Thai month name
          expect(containsThaiMonth(formatted)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should format date-time values using Thai locale', () => {
      fc.assert(
        fc.property(arbitraryDate(), (date) => {
          const formatted = formatDateTime(date);
          
          // The formatted date-time should be a non-empty string
          expect(formatted).toBeTruthy();
          expect(typeof formatted).toBe('string');
          expect(formatted.length).toBeGreaterThan(0);
          
          // The formatted date-time should use Thai locale
          const expectedFormat = new Intl.DateTimeFormat('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).format(date);
          
          expect(formatted).toBe(expectedFormat);
        }),
        { numRuns: 100 }
      );
    });

    it('should format time values using Thai locale', () => {
      fc.assert(
        fc.property(arbitraryDate(), (date) => {
          const formatted = formatTime(date);
          
          // The formatted time should be a non-empty string
          expect(formatted).toBeTruthy();
          expect(typeof formatted).toBe('string');
          expect(formatted.length).toBeGreaterThan(0);
          
          // The formatted time should use Thai locale
          const expectedFormat = new Intl.DateTimeFormat('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }).format(date);
          
          expect(formatted).toBe(expectedFormat);
        }),
        { numRuns: 100 }
      );
    });

    it('should format time strings using Thai locale conventions', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 23 }),
          fc.integer({ min: 0, max: 59 }),
          (hours, minutes) => {
            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            const formatted = formatTime(timeString);
            
            // The formatted time should be a non-empty string
            expect(formatted).toBeTruthy();
            expect(typeof formatted).toBe('string');
            
            // Create a date object to compare
            const date = new Date();
            date.setHours(hours, minutes, 0, 0);
            const expectedFormat = new Intl.DateTimeFormat('th-TH', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }).format(date);
            
            expect(formatted).toBe(expectedFormat);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format dates consistently across different date inputs', () => {
      fc.assert(
        fc.property(arbitraryDate(), (date) => {
          // Format the same date as Date object and as ISO string
          const formattedFromDate = formatDate(date);
          const formattedFromString = formatDate(date.toISOString());
          
          // Both should produce the same result
          expect(formattedFromDate).toBe(formattedFromString);
        }),
        { numRuns: 100 }
      );
    });

    it('should format date-time consistently across different inputs', () => {
      fc.assert(
        fc.property(arbitraryDate(), (date) => {
          // Format the same date-time as Date object and as ISO string
          const formattedFromDate = formatDateTime(date);
          const formattedFromString = formatDateTime(date.toISOString());
          
          // Both should produce the same result
          expect(formattedFromDate).toBe(formattedFromString);
        }),
        { numRuns: 100 }
      );
    });

    it('should respect custom format options while maintaining Thai locale', () => {
      fc.assert(
        fc.property(arbitraryDate(), arbitraryDateFormatOptions(), (date, options) => {
          const formatted = formatDate(date, options);
          
          // The formatted date should be a non-empty string
          expect(formatted).toBeTruthy();
          expect(typeof formatted).toBe('string');
          
          // The formatted date should match the expected Thai locale format with custom options
          const expectedFormat = new Intl.DateTimeFormat('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            ...options,
          }).format(date);
          
          expect(formatted).toBe(expectedFormat);
        }),
        { numRuns: 100 }
      );
    });

    it('should format dates with Thai Buddhist Era year when appropriate', () => {
      fc.assert(
        fc.property(arbitraryDate(), (date) => {
          // Format with default options
          const formatted = formatDate(date);
          
          // The formatted date should use Thai locale formatting
          // Thai locale typically uses Buddhist Era (BE) which is 543 years ahead of Gregorian
          const thaiFormatter = new Intl.DateTimeFormat('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          
          const expectedFormat = thaiFormatter.format(date);
          expect(formatted).toBe(expectedFormat);
          
          // Verify the year in the formatted string matches Thai Buddhist Era
          const gregorianYear = date.getFullYear();
          const buddhistYear = gregorianYear + 543;
          
          // The formatted date should contain the Buddhist Era year
          expect(formatted).toContain(buddhistYear.toString());
        }),
        { numRuns: 100 }
      );
    });

    it('should format relative times in Thai language', () => {
      fc.assert(
        fc.property(
          fc.date({
            min: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            max: new Date(),
          }),
          (date) => {
            const formatted = formatRelativeTime(date);
            
            // The formatted relative time should be a non-empty string
            expect(formatted).toBeTruthy();
            expect(typeof formatted).toBe('string');
            
            // The formatted relative time should contain Thai characters
            expect(containsThaiCharacters(formatted)).toBe(true);
            
            // Common Thai relative time words
            const thaiRelativeTimeWords = ['เมื่อสักครู่', 'นาทีที่แล้ว', 'ชั่วโมงที่แล้ว', 'วันที่แล้ว', 'เดือนที่แล้ว', 'ปีที่แล้ว'];
            const containsRelativeTimeWord = thaiRelativeTimeWords.some(word => 
              formatted.includes(word) || formatted.endsWith('ที่แล้ว')
            );
            
            expect(containsRelativeTimeWord).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should ensure all date formatting functions use th-TH locale', () => {
      const testDate = new Date('2024-12-09T14:30:00');
      
      // Test formatDate
      const formattedDate = formatDate(testDate);
      const expectedDate = new Intl.DateTimeFormat('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(testDate);
      expect(formattedDate).toBe(expectedDate);
      
      // Test formatDateTime
      const formattedDateTime = formatDateTime(testDate);
      const expectedDateTime = new Intl.DateTimeFormat('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(testDate);
      expect(formattedDateTime).toBe(expectedDateTime);
      
      // Test formatTime
      const formattedTime = formatTime(testDate);
      const expectedTime = new Intl.DateTimeFormat('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(testDate);
      expect(formattedTime).toBe(expectedTime);
    });
  });
});
