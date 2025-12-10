# Localization System

This directory contains the Thai language localization system for the AI Travel Itinerary application.

## Overview

The localization system provides:
- Thai language translations for all UI text
- Date/time formatting utilities for Thai locale
- Validation error messages in Thai
- Authentication messages in Thai

## Usage

### Basic Translation

```typescript
import { t } from '@/lib/localization';

// Get a translation
const title = t('auth.loginTitle'); // Returns: 'เข้าสู่ระบบ'
const button = t('common.submit'); // Returns: 'ส่ง'
```

### Date and Time Formatting

```typescript
import { formatDate, formatDateTime, formatTime, formatRelativeTime } from '@/lib/localization';

// Format a date
const date = formatDate(new Date()); // Returns: '9 ธันวาคม 2568' (Thai Buddhist calendar)

// Format date and time
const dateTime = formatDateTime(new Date()); // Returns: '9 ธันวาคม 2568 14:30'

// Format time
const time = formatTime('14:30'); // Returns: '14:30'
const time12h = formatTime('14:30', false); // Returns: '2:30 PM' (in Thai format)

// Format relative time
const relative = formatRelativeTime(new Date(Date.now() - 3600000)); // Returns: '1 ชั่วโมงที่แล้ว'
```

### Duration Formatting

```typescript
import { formatDuration } from '@/lib/localization';

const duration = formatDuration(5); // Returns: '5 วัน'
```

### Error Messages

```typescript
import { getValidationError, getAuthError, getErrorMessage } from '@/lib/localization';

// Validation errors
const error1 = getValidationError('required'); // Returns: 'กรุณากรอกข้อมูลนี้'
const error2 = getValidationError('destinationRequired'); // Returns: 'กรุณากรอกจุดหมายปลายทาง'

// Authentication errors
const authError = getAuthError('invalidCredentials'); // Returns: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'

// General errors
const genError = getErrorMessage('networkError'); // Returns: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาตรวจสอบอินเทอร์เน็ตของคุณ'
```

## Translation Structure

Translations are organized by category in `th.ts`:

- `common`: Common UI elements (buttons, labels, etc.)
- `navigation`: Navigation menu items
- `auth`: Authentication-related text
- `destinationForm`: Destination input form
- `validation`: Form validation errors
- `itinerary`: Itinerary display text
- `history`: History page text
- `errors`: Error messages
- `success`: Success messages

## Adding New Translations

To add new translations:

1. Add the translation key and value to `th.ts` in the appropriate category
2. Use the `t()` function to access the translation in your components

Example:

```typescript
// In th.ts
export const th = {
  // ... existing translations
  myNewCategory: {
    myNewKey: 'ข้อความภาษาไทย',
  },
};

// In your component
import { t } from '@/lib/localization';

const text = t('myNewCategory.myNewKey');
```

## Date/Time Formatting

The system uses the `Intl.DateTimeFormat` API with the `th-TH` locale for consistent Thai language date and time formatting. This ensures:

- Dates are displayed in Thai Buddhist calendar (พ.ศ.)
- Month names are in Thai
- Time formatting follows Thai conventions

## Requirements Coverage

This localization system satisfies the following requirements:

- **Requirement 10.1**: All UI elements displayed in Thai language
- **Requirement 10.3**: Validation errors in Thai language
- **Requirement 10.4**: Authentication messages in Thai language
- **Requirement 10.5**: Date/time formatting according to Thai locale conventions
