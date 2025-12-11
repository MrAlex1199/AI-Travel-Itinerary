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
        }),
      ],
      logLevel: 'debug',
    });
    configured = true;
  }
}
