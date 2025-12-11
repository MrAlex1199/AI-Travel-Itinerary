import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
if (!apiKey) {
  // Throwing here will fail app startup — that's helpful in dev so you notice missing creds.
  throw new Error('Missing GEMINI_API_KEY in environment');
}

export const aiClient = new GoogleGenAI({
  apiKey,
});
