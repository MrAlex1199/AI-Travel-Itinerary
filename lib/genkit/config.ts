/**
 * Genkit Configuration
 * 
 * Configures Genkit with Google Gemini AI for itinerary generation.
 */

import { configureGenkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';

// Configure Genkit with Google AI plugin - only once
let configured = false;

export function ensureGenkitConfigured() {
  if (!configured) {
    configureGenkit({
      plugins: [
        googleAI({
          apiKey: process.env.GOOGLE_AI_API_KEY,
          // Use explicit model identifiers as strings. The previous
          // named exports (e.g. `gemini25Flash`) are not available
          // in the installed `@genkit-ai/googleai` package version
          // which caused import errors during bundling.
          models: [
            'googleai/gemini-2.5-flash',
            'googleai/gemini-2.5-pro',
            'googleai/gemini-3-pro-preview',
            'googleai/gemini-2.0-flash-exp',
          ],
        }),
      ],
      logLevel: 'debug',
      enableTracing: true,
    });
    configured = true;
  }
}
