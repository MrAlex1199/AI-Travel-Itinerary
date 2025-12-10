# Genkit AI Integration

This directory contains the configuration and setup for Google Gemini AI integration using the Genkit framework.

## Setup

1. Get your Google AI API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

2. Add the API key to your `.env` file:
   ```
   GOOGLE_AI_API_KEY=your_api_key_here
   ```

3. The Genkit configuration is automatically initialized when the ItineraryGenerator service is used.

## Configuration

The `config.ts` file configures Genkit with:
- Google AI plugin for Gemini models
- API key from environment variables
- Gemini 1.5 Flash model as the default model

## Usage

The ItineraryGenerator service uses this configuration to generate travel itineraries:

```typescript
import { ItineraryGenerator } from '@/services';

const generator = new ItineraryGenerator();
const itinerary = await generator.generateItinerary(
  { destination: 'Bangkok', duration: 3 },
  'th'
);
```

## Features

- Automatic retry logic with exponential backoff
- Timeout protection (30 seconds)
- Structured output parsing with Zod validation
- Thai language content generation
- Comprehensive error handling for:
  - API timeouts
  - Rate limiting
  - Malformed responses
  - Network errors

## Error Messages

All error messages are localized in Thai for the end user:
- Timeout: "การสร้างแผนการท่องเที่ยวใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง"
- Rate limit: "ระบบมีผู้ใช้งานมากเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง"
- General error: "เกิดข้อผิดพลาดในการสร้างแผนการท่องเที่ยว กรุณาลองใหม่อีกครั้ง"
