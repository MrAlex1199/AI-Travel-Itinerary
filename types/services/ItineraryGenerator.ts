/**
 * Itinerary Generator Service
 * 
 * Generates personalized travel itineraries using Google Gemini AI via Genkit.
 */

import { aiClient } from '@/lib/googleai/client';
import { TripInput, Itinerary, Recommendation } from '@/types';
import { z } from 'zod';

// Available models to try (in order of preference, December 2025)
// Using the official Google Gemini models via @google/genai
// Preference: Fastest stable first, then more capable models
const FALLBACK_MODELS = [
  'gemini-2.5-flash',      // Fastest & best for most tasks
  'gemini-2.5-pro',        // More capable for complex reasoning
  'gemini-1.5-pro',        // High-quality responses
  'gemini-1.5-flash',      // Fast fallback
] as const;

const ActivitySchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/),
  name: z.string(),
  location: z.string(),
  description: z.string(),
});

const DailyScheduleSchema = z.object({
  day: z.number().int().positive(),
  activities: z.array(ActivitySchema).min(3),
});

const RecommendationSchema = z.object({
  category: z.enum(['place', 'restaurant', 'experience']),
  name: z.string(),
  description: z.string(),
  location: z.string().optional(),
});

const ItineraryResponseSchema = z.object({
  dailySchedules: z.array(DailyScheduleSchema),
  recommendations: z.array(RecommendationSchema),
});

export interface IItineraryGenerator {
  generateItinerary(input: TripInput, locale: string): Promise<Itinerary>;
}

export class ItineraryGenerator implements IItineraryGenerator {
  private maxRetries = 3;
  private retryDelay = 1000;
  private timeout = 45000;

  async generateItinerary(input: TripInput, locale: string = 'th'): Promise<Itinerary> {
    const { destination, duration } = input;

    if (!destination || destination.trim().length === 0) {
      throw new Error('Destination is required');
    }
    if (duration < 1) {
      throw new Error('Duration must be at least 1 day');
    }

    let lastError: Error | null = null;

    // Try each model with retries
    for (const model of FALLBACK_MODELS) {
      for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
        try {
          console.log(`🤖 Trying model: ${model} (attempt ${attempt}/${this.maxRetries})`);
          const result = await this.generateWithTimeout(model, destination, duration, locale);
          console.log(`✅ Success with model: ${model}`);
          return result;
        } catch (error: any) {
          lastError = error;
          console.error(`❌ Failed with ${model}:`, error.message);

          // If model not found, skip to next model immediately
          if (error.message?.includes('not found') || error.message?.includes('404')) {
            console.log(`⏭️ Model ${model} not available, trying next...`);
            break;
          }

          // If retryable error, wait and retry same model
          if (this.isRetryableError(error) && attempt < this.maxRetries) {
            const delay = this.retryDelay * Math.pow(2, attempt - 1);
            console.log(`⏳ Retrying in ${delay}ms...`);
            await this.sleep(delay);
            continue;
          }

          // Non-retryable error, try next model
          break;
        }
      }
    }

    throw this.handleError(lastError || new Error('All models failed'));
  }


  private async generateWithTimeout(
    model: string,
    destination: string,
    duration: number,
    locale: string
  ): Promise<Itinerary> {
    return Promise.race([
      this.callGeminiAPI(model, destination, duration, locale),
      this.timeoutPromise(),
    ]);
  }

  private async callGeminiAPI(
    model: string,
    destination: string,
    duration: number,
    locale: string
  ): Promise<Itinerary> {
    const prompt = this.buildPrompt(destination, duration, locale);

    // Use the official Google GenAI client
    const response = await aiClient.models.generateContent({
      model,
      contents: prompt,
      // You can add additional options here (temperature, safety, etc.)
    });

    // SDK response shapes vary across versions; try common fields
    let generatedText: string | undefined;
    // new SDKs sometimes expose `response.text`
    if ((response as any)?.text) {
      generatedText = typeof (response as any).text === 'function' ? (response as any).text() : (response as any).text;
    }
    // other SDK shapes: response.output[0].content[0].text
    if (!generatedText && (response as any)?.output?.[0]?.content) {
      const content = (response as any).output[0].content;
      const firstText = content.find((c: any) => typeof c.text === 'string' || c.type === 'output_text');
      generatedText = firstText?.text || firstText?.parts?.join('') || undefined;
    }

    if (!generatedText) {
      throw new Error('Empty response from AI');
    }

    const itineraryData = this.parseAIResponse(String(generatedText));
    const validated = ItineraryResponseSchema.parse(itineraryData);

    // Sort activities by time for each day to ensure chronological order
    validated.dailySchedules.forEach(schedule => {
      schedule.activities.sort((a, b) => a.time.localeCompare(b.time));
    });

    if (validated.dailySchedules.length !== duration) {
      throw new Error(`Expected ${duration} days but got ${validated.dailySchedules.length}`);
    }

    return {
      id: this.generateId(),
      destination,
      duration,
      dailySchedules: validated.dailySchedules,
      recommendations: validated.recommendations.map((rec) => ({
        ...rec,
        id: this.generateId(),
      })),
      generatedAt: new Date(),
    };
  }

  private buildPrompt(destination: string, duration: number, locale: string): string {
    const languageInstruction = locale === 'th' 
      ? 'คุณต้องตอบเป็นภาษาไทยเท่านั้น ทุกคำอธิบาย ชื่อกิจกรรม และสถานที่ต้องเป็นภาษาไทย'
      : 'You must respond in Thai language only. All descriptions, activity names, and locations must be in Thai.';

    return `${languageInstruction}

สร้างแผนการท่องเที่ยวสำหรับ ${destination} เป็นเวลา ${duration} วัน

กรุณาสร้างแผนการท่องเที่ยวที่มีโครงสร้างดังนี้:

1. กำหนดการรายวัน (dailySchedules): สำหรับแต่ละวันของการเดินทาง ให้สร้างรายการกิจกรรมอย่างน้อย 3 กิจกรรมต่อวัน
   - แต่ละกิจกรรมต้องมี:
     * time: เวลาในรูปแบบ HH:mm (เช่น "09:00", "14:30")
     * name: ชื่อกิจกรรมเป็นภาษาไทย
     * location: สถานที่เป็นภาษาไทย
     * description: คำอธิบายกิจกรรมเป็นภาษาไทย

2. คำแนะนำ (recommendations): สร้างรายการสถานที่แนะนำอย่างน้อย 5 แห่ง ประกอบด้วย:
   - สถานที่ท่องเที่ยว (category: "place") อย่างน้อย 2 แห่ง
   - ร้านอาหาร (category: "restaurant") อย่างน้อย 2 แห่ง
   - กิจกรรมพิเศษ (category: "experience") อย่างน้อย 1 กิจกรรม

กรุณาตอบกลับในรูปแบบ JSON เท่านั้น โดยไม่ต้องมีข้อความอื่นใด:

{
  "dailySchedules": [
    {
      "day": 1,
      "activities": [
        {"time": "09:00", "name": "ชื่อกิจกรรม", "location": "สถานที่", "description": "คำอธิบาย"}
      ]
    }
  ],
  "recommendations": [
    {"category": "place", "name": "ชื่อสถานที่", "description": "คำอธิบาย", "location": "ที่อยู่"}
  ]
}`;
  }

  private parseAIResponse(text: string): unknown {
    let jsonText = text.trim();
    
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      return JSON.parse(jsonText);
    } catch {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in AI response');
    }
  }

  private isRetryableError(error: any): boolean {
    const msg = error?.message?.toLowerCase() || '';
    return ['timeout', 'rate limit', '429', '503', 'network', 'unavailable'].some(term => msg.includes(term));
  }

  private handleError(error: any): Error {
    const msg = error?.message || 'Unknown error';
    console.error('Final error:', msg);
    
    if (msg.includes('timeout')) return new Error('การสร้างแผนใช้เวลานานเกินไป กรุณาลองใหม่');
    if (msg.includes('rate limit') || msg.includes('429')) return new Error('ระบบมีผู้ใช้งานมาก กรุณารอสักครู่');
    if (msg.includes('API key') || msg.includes('401')) return new Error('เกิดข้อผิดพลาดในการเชื่อมต่อ AI');
    if (msg.includes('not found') || msg.includes('404')) return new Error('โมเดล AI ไม่พร้อมใช้งาน');
    
    return new Error('เกิดข้อผิดพลาดในการสร้างแผนการท่องเที่ยว กรุณาลองใหม่');
  }

  private timeoutPromise(): Promise<never> {
    return new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), this.timeout));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}
