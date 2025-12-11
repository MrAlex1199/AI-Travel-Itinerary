/**
 * Test script to diagnose Google GenAI client issues.
 * Calls the SDK directly and prints full error details.
 */

import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

console.log('🔍 GenAI Client Test');
console.log('-------------------');
console.log(`✓ API Key present: ${apiKey ? 'Yes (first 10 chars: ' + apiKey.substring(0, 10) + '...)' : 'No'}`);

if (!apiKey) {
  console.error('❌ Error: No API key found in GEMINI_API_KEY or GOOGLE_AI_API_KEY');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

(async () => {
  try {
    console.log('🚀 Calling ai.models.generateContent with model: "gemini-2.5-flash"');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Say "Hello" in one word.',
    });
    console.log('✅ Success! Response:');
    console.log(JSON.stringify(response, null, 2));
  } catch (error: any) {
    console.error('❌ Error:');
    console.error('  Message:', error.message);
    console.error('  Status:', error.status || error.statusCode || 'N/A');
    console.error('  Code:', error.code || 'N/A');
    console.error('  Details:', error.details || 'N/A');
    console.error('  Full error:', JSON.stringify(error, null, 2));
  }
})();
