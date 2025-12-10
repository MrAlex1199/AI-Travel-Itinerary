/**
 * Localization utilities for the application
 */

import { th } from './th';

// Current locale (can be extended to support multiple locales)
const currentLocale = 'th';

// Translation dictionary
const translations = {
  th,
};

/**
 * Get a translation by key path
 * @param keyPath - Dot-separated path to translation key (e.g., 'auth.loginTitle')
 * @returns Translated string
 */
export function t(keyPath: string): string {
  const keys = keyPath.split('.');
  let value: any = translations[currentLocale];

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      console.warn(`Translation key not found: ${keyPath}`);
      return keyPath;
    }
  }

  return typeof value === 'string' ? value : keyPath;
}

/**
 * Format a date according to Thai locale conventions
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat('th-TH', defaultOptions).format(dateObj);
}

/**
 * Format a date and time according to Thai locale conventions
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date and time string
 */
export function formatDateTime(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  };

  return new Intl.DateTimeFormat('th-TH', defaultOptions).format(dateObj);
}

/**
 * Format a time according to Thai locale conventions
 * @param time - Time string (HH:mm format) or Date object
 * @param use24Hour - Whether to use 24-hour format (default: true)
 * @returns Formatted time string
 */
export function formatTime(time: string | Date, use24Hour: boolean = true): string {
  let dateObj: Date;

  if (typeof time === 'string') {
    // Parse HH:mm format
    const [hours, minutes] = time.split(':').map(Number);
    dateObj = new Date();
    dateObj.setHours(hours, minutes, 0, 0);
  } else {
    dateObj = time;
  }

  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !use24Hour,
  };

  return new Intl.DateTimeFormat('th-TH', options).format(dateObj);
}

/**
 * Format a relative time (e.g., "2 days ago")
 * @param date - Date to format
 * @returns Relative time string in Thai
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'เมื่อสักครู่';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} นาทีที่แล้ว`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ชั่วโมงที่แล้ว`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} วันที่แล้ว`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} เดือนที่แล้ว`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} ปีที่แล้ว`;
}

/**
 * Format a duration in days
 * @param days - Number of days
 * @returns Formatted duration string in Thai
 */
export function formatDuration(days: number): string {
  return `${days} วัน`;
}

/**
 * Get validation error message
 * @param errorType - Type of validation error
 * @param fieldName - Optional field name for context
 * @returns Error message in Thai
 */
export function getValidationError(
  errorType: 'required' | 'invalidEmail' | 'invalidPassword' | 'destinationRequired' | 'durationRequired' | 'durationMinimum' | 'durationInvalid' | 'passwordTooShort' | 'passwordsDoNotMatch',
  fieldName?: string
): string {
  return t(`validation.${errorType}`);
}

/**
 * Get authentication error message
 * @param errorType - Type of authentication error
 * @returns Error message in Thai
 */
export function getAuthError(
  errorType: 'invalidCredentials' | 'emailAlreadyExists' | 'sessionExpired' | 'weakPassword' | 'passwordMismatch' | 'registrationFailed' | 'loginFailed' | 'logoutFailed' | 'authenticationRequired' | 'unauthorized'
): string {
  return t(`auth.${errorType}`);
}

/**
 * Get general error message
 * @param errorType - Type of error
 * @returns Error message in Thai
 */
export function getErrorMessage(
  errorType: 'generic' | 'networkError' | 'serverError' | 'notFound' | 'timeout' | 'aiGenerationFailed' | 'aiTimeout' | 'aiRateLimit' | 'aiInvalidResponse' | 'databaseError' | 'saveFailed' | 'loadFailed'
): string {
  return t(`errors.${errorType}`);
}

// Export translations for direct access if needed
export { th };
export type { TranslationKey } from './th';
