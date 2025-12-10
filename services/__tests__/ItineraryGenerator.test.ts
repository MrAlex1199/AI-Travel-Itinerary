/**
 * Itinerary Generator Service Tests
 * 
 * Tests for the AI-powered itinerary generation service.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ItineraryGenerator } from '../ItineraryGenerator';
import { TripInput } from '@/types';
import * as fc from 'fast-check';

// Mock the @genkit-ai/ai module
vi.mock('@genkit-ai/ai', () => ({
  generate: vi.fn(),
}));

// Mock the genkit config
vi.mock('@/lib/genkit/config', () => ({
  ensureGenkitConfigured: vi.fn(),
  geminiModel: 'googleai/gemini-1.5-flash',
}));

describe('ItineraryGenerator', () => {
  let generator: ItineraryGenerator;

  beforeEach(() => {
    generator = new ItineraryGenerator();
  });

  describe('Input Validation', () => {
    it('should reject empty destination', async () => {
      const input: TripInput = {
        destination: '',
        duration: 3,
      };

      await expect(generator.generateItinerary(input, 'th')).rejects.toThrow(
        'Destination is required'
      );
    });

    it('should reject whitespace-only destination', async () => {
      const input: TripInput = {
        destination: '   ',
        duration: 3,
      };

      await expect(generator.generateItinerary(input, 'th')).rejects.toThrow(
        'Destination is required'
      );
    });

    it('should reject duration less than 1', async () => {
      const input: TripInput = {
        destination: 'Bangkok',
        duration: 0,
      };

      await expect(generator.generateItinerary(input, 'th')).rejects.toThrow(
        'Duration must be at least 1 day'
      );
    });

    it('should reject negative duration', async () => {
      const input: TripInput = {
        destination: 'Bangkok',
        duration: -1,
      };

      await expect(generator.generateItinerary(input, 'th')).rejects.toThrow(
        'Duration must be at least 1 day'
      );
    });
  });

  describe('Service Structure', () => {
    it('should be instantiable', () => {
      expect(generator).toBeInstanceOf(ItineraryGenerator);
    });

    it('should have generateItinerary method', () => {
      expect(typeof generator.generateItinerary).toBe('function');
    });
  });

  describe('Property-Based Tests', () => {
    // Feature: ai-travel-itinerary, Property 4: Generated itineraries match requested duration
    it('Property 4: generated itineraries match requested duration', async () => {
      const { generate } = await import('@genkit-ai/ai');

      // Custom arbitraries for valid inputs
      const arbitraryDestination = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
      const arbitraryDuration = fc.integer({ min: 1, max: 30 });

      await fc.assert(
        fc.asyncProperty(
          arbitraryDestination,
          arbitraryDuration,
          async (destination, duration) => {
            // Create mock response that matches the expected structure
            const mockDailySchedules = Array.from({ length: duration }, (_, i) => ({
              day: i + 1,
              activities: [
                {
                  time: '09:00',
                  name: 'กิจกรรมเช้า',
                  location: 'สถานที่ท่องเที่ยว',
                  description: 'คำอธิบายกิจกรรม',
                },
                {
                  time: '12:00',
                  name: 'กิจกรรมกลางวัน',
                  location: 'ร้านอาหาร',
                  description: 'คำอธิบายกิจกรรม',
                },
                {
                  time: '15:00',
                  name: 'กิจกรรมบ่าย',
                  location: 'สถานที่ท่องเที่ยว',
                  description: 'คำอธิบายกิจกรรม',
                },
              ],
            }));

            const mockRecommendations = [
              {
                category: 'place',
                name: 'สถานที่แนะนำ 1',
                description: 'คำอธิบาย',
                location: 'ที่อยู่',
              },
              {
                category: 'restaurant',
                name: 'ร้านอาหารแนะนำ',
                description: 'คำอธิบาย',
                location: 'ที่อยู่',
              },
            ];

            const mockResponse = {
              dailySchedules: mockDailySchedules,
              recommendations: mockRecommendations,
            };

            vi.mocked(generate).mockResolvedValueOnce({
              text: JSON.stringify(mockResponse),
            } as any);

            // Generate itinerary
            const input: TripInput = { destination, duration };
            const itinerary = await generator.generateItinerary(input, 'th');

            // Property: The number of daily schedules should match the requested duration
            expect(itinerary.dailySchedules.length).toBe(duration);
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: ai-travel-itinerary, Property 5: Each daily schedule contains minimum activities
    it('Property 5: each daily schedule contains minimum activities', async () => {
      const { generate } = await import('@genkit-ai/ai');

      // Custom arbitraries for valid inputs
      const arbitraryDestination = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
      const arbitraryDuration = fc.integer({ min: 1, max: 30 });
      // Generate random number of activities (3 to 10) to test the property
      const arbitraryActivityCount = fc.integer({ min: 3, max: 10 });

      await fc.assert(
        fc.asyncProperty(
          arbitraryDestination,
          arbitraryDuration,
          arbitraryActivityCount,
          async (destination, duration, activityCount) => {
            // Create mock response with varying number of activities per day
            const mockDailySchedules = Array.from({ length: duration }, (_, i) => ({
              day: i + 1,
              activities: Array.from({ length: activityCount }, (_, j) => ({
                time: `${String(9 + j).padStart(2, '0')}:00`,
                name: `กิจกรรม ${j + 1}`,
                location: 'สถานที่ท่องเที่ยว',
                description: 'คำอธิบายกิจกรรม',
              })),
            }));

            const mockRecommendations = [
              {
                category: 'place',
                name: 'สถานที่แนะนำ 1',
                description: 'คำอธิบาย',
                location: 'ที่อยู่',
              },
              {
                category: 'restaurant',
                name: 'ร้านอาหารแนะนำ',
                description: 'คำอธิบาย',
                location: 'ที่อยู่',
              },
            ];

            const mockResponse = {
              dailySchedules: mockDailySchedules,
              recommendations: mockRecommendations,
            };

            vi.mocked(generate).mockResolvedValueOnce({
              text: JSON.stringify(mockResponse),
            } as any);

            // Generate itinerary
            const input: TripInput = { destination, duration };
            const itinerary = await generator.generateItinerary(input, 'th');

            // Property: Every daily schedule should contain at least 3 activities
            for (const schedule of itinerary.dailySchedules) {
              expect(schedule.activities.length).toBeGreaterThanOrEqual(3);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: ai-travel-itinerary, Property 6: Successful generation returns complete itinerary
    it('Property 6: successful generation returns complete itinerary', async () => {
      const { generate } = await import('@genkit-ai/ai');

      // Custom arbitraries for valid inputs
      const arbitraryDestination = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
      const arbitraryDuration = fc.integer({ min: 1, max: 30 });

      await fc.assert(
        fc.asyncProperty(
          arbitraryDestination,
          arbitraryDuration,
          async (destination, duration) => {
            // Create mock response that matches the expected structure
            const mockDailySchedules = Array.from({ length: duration }, (_, i) => ({
              day: i + 1,
              activities: [
                {
                  time: '09:00',
                  name: 'กิจกรรมเช้า',
                  location: 'สถานที่ท่องเที่ยว',
                  description: 'คำอธิบายกิจกรรม',
                },
                {
                  time: '12:00',
                  name: 'กิจกรรมกลางวัน',
                  location: 'ร้านอาหาร',
                  description: 'คำอธิบายกิจกรรม',
                },
                {
                  time: '15:00',
                  name: 'กิจกรรมบ่าย',
                  location: 'สถานที่ท่องเที่ยว',
                  description: 'คำอธิบายกิจกรรม',
                },
              ],
            }));

            const mockRecommendations = [
              {
                category: 'place',
                name: 'สถานที่แนะนำ 1',
                description: 'คำอธิบาย',
                location: 'ที่อยู่',
              },
              {
                category: 'restaurant',
                name: 'ร้านอาหารแนะนำ',
                description: 'คำอธิบาย',
                location: 'ที่อยู่',
              },
            ];

            const mockResponse = {
              dailySchedules: mockDailySchedules,
              recommendations: mockRecommendations,
            };

            vi.mocked(generate).mockResolvedValueOnce({
              text: JSON.stringify(mockResponse),
            } as any);

            // Generate itinerary
            const input: TripInput = { destination, duration };
            const itinerary = await generator.generateItinerary(input, 'th');

            // Property: Successful generation returns complete itinerary with all required fields
            expect(itinerary).toBeDefined();
            expect(itinerary.id).toBeDefined();
            expect(typeof itinerary.id).toBe('string');
            expect(itinerary.destination).toBe(destination);
            expect(itinerary.duration).toBe(duration);
            expect(itinerary.dailySchedules).toBeDefined();
            expect(Array.isArray(itinerary.dailySchedules)).toBe(true);
            expect(itinerary.dailySchedules.length).toBeGreaterThan(0);
            expect(itinerary.recommendations).toBeDefined();
            expect(Array.isArray(itinerary.recommendations)).toBe(true);
            expect(itinerary.recommendations.length).toBeGreaterThan(0);
            expect(itinerary.generatedAt).toBeDefined();
            expect(itinerary.generatedAt).toBeInstanceOf(Date);
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: ai-travel-itinerary, Property 24: AI-generated content is in Thai
    it('Property 24: AI-generated content is in Thai', async () => {
      const { generate } = await import('@genkit-ai/ai');

      // Custom arbitraries for valid inputs
      const arbitraryDestination = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
      const arbitraryDuration = fc.integer({ min: 1, max: 30 });

      // Helper function to check if text contains Thai characters
      const containsThaiCharacters = (text: string): boolean => {
        // Thai Unicode range: \u0E00-\u0E7F
        const thaiRegex = /[\u0E00-\u0E7F]/;
        return thaiRegex.test(text);
      };

      await fc.assert(
        fc.asyncProperty(
          arbitraryDestination,
          arbitraryDuration,
          async (destination, duration) => {
            // Create mock response with Thai content
            const mockDailySchedules = Array.from({ length: duration }, (_, i) => ({
              day: i + 1,
              activities: [
                {
                  time: '09:00',
                  name: 'เยี่ยมชมวัดพระแก้ว',
                  location: 'กรุงเทพมหานคร',
                  description: 'ชมความงามของวัดพระแก้วและพระบรมมหาราชวัง',
                },
                {
                  time: '12:00',
                  name: 'รับประทานอาหารกลางวัน',
                  location: 'ร้านอาหารริมแม่น้ำเจ้าพระยา',
                  description: 'ลิ้มรสอาหารไทยแท้พร้อมวิวแม่น้ำ',
                },
                {
                  time: '15:00',
                  name: 'ช้อปปิ้งที่ตลาดนัดจตุจักร',
                  location: 'จตุจักร กรุงเทพฯ',
                  description: 'เดินเล่นและช้อปปิ้งของฝากที่ตลาดนัดที่ใหญ่ที่สุด',
                },
              ],
            }));

            const mockRecommendations = [
              {
                category: 'place',
                name: 'วัดอรุณราชวราราม',
                description: 'วัดที่มีเจดีย์สูงสวยงามริมแม่น้ำเจ้าพระยา',
                location: 'กรุงเทพมหานคร',
              },
              {
                category: 'restaurant',
                name: 'ร้านส้มตำนัวเอก',
                description: 'ร้านอาหารอีสานรสชาติดีเยี่ยม',
                location: 'สุขุมวิท กรุงเทพฯ',
              },
              {
                category: 'experience',
                name: 'ล่องเรือแม่น้ำเจ้าพระยา',
                description: 'ชมวิวกรุงเทพฯ ยามค่ำคืนจากเรือ',
                location: 'แม่น้ำเจ้าพระยา',
              },
            ];

            const mockResponse = {
              dailySchedules: mockDailySchedules,
              recommendations: mockRecommendations,
            };

            vi.mocked(generate).mockResolvedValueOnce({
              text: JSON.stringify(mockResponse),
            } as any);

            // Generate itinerary
            const input: TripInput = { destination, duration };
            const itinerary = await generator.generateItinerary(input, 'th');

            // Property: All AI-generated content should be in Thai
            // Check activity names, locations, and descriptions
            for (const schedule of itinerary.dailySchedules) {
              for (const activity of schedule.activities) {
                expect(containsThaiCharacters(activity.name)).toBe(true);
                expect(containsThaiCharacters(activity.location)).toBe(true);
                expect(containsThaiCharacters(activity.description)).toBe(true);
              }
            }

            // Check recommendation names and descriptions
            for (const recommendation of itinerary.recommendations) {
              expect(containsThaiCharacters(recommendation.name)).toBe(true);
              expect(containsThaiCharacters(recommendation.description)).toBe(true);
              // Location is optional, but if present, should be in Thai
              if (recommendation.location) {
                expect(containsThaiCharacters(recommendation.location)).toBe(true);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: ai-travel-itinerary, Property 10: Recommendations include required categories
    it('Property 10: recommendations include required categories', async () => {
      const { generate } = await import('@genkit-ai/ai');

      // Custom arbitraries for valid inputs
      const arbitraryDestination = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);
      const arbitraryDuration = fc.integer({ min: 1, max: 30 });

      // Generate random recommendations with varying categories
      const arbitraryRecommendations = fc.array(
        fc.record({
          category: fc.constantFrom('place', 'restaurant', 'experience'),
          name: fc.string({ minLength: 5, maxLength: 50 }),
          description: fc.string({ minLength: 10, maxLength: 100 }),
          location: fc.option(fc.string({ minLength: 5, maxLength: 50 }), { nil: undefined }),
        }),
        { minLength: 2, maxLength: 10 }
      ).filter(recommendations => {
        // Ensure we have at least one 'place' and one 'restaurant'
        const hasPlace = recommendations.some(r => r.category === 'place');
        const hasRestaurant = recommendations.some(r => r.category === 'restaurant');
        return hasPlace && hasRestaurant;
      });

      await fc.assert(
        fc.asyncProperty(
          arbitraryDestination,
          arbitraryDuration,
          arbitraryRecommendations,
          async (destination, duration, recommendations) => {
            // Create mock response with the generated recommendations
            const mockDailySchedules = Array.from({ length: duration }, (_, i) => ({
              day: i + 1,
              activities: [
                {
                  time: '09:00',
                  name: 'กิจกรรมเช้า',
                  location: 'สถานที่ท่องเที่ยว',
                  description: 'คำอธิบายกิจกรรม',
                },
                {
                  time: '12:00',
                  name: 'กิจกรรมกลางวัน',
                  location: 'ร้านอาหาร',
                  description: 'คำอธิบายกิจกรรม',
                },
                {
                  time: '15:00',
                  name: 'กิจกรรมบ่าย',
                  location: 'สถานที่ท่องเที่ยว',
                  description: 'คำอธิบายกิจกรรม',
                },
              ],
            }));

            const mockResponse = {
              dailySchedules: mockDailySchedules,
              recommendations: recommendations,
            };

            vi.mocked(generate).mockResolvedValueOnce({
              text: JSON.stringify(mockResponse),
            } as any);

            // Generate itinerary
            const input: TripInput = { destination, duration };
            const itinerary = await generator.generateItinerary(input, 'th');

            // Property: Recommendations should include at least one place of interest and at least one restaurant
            const categories = itinerary.recommendations.map(r => r.category);
            const hasPlace = categories.includes('place');
            const hasRestaurant = categories.includes('restaurant');

            expect(hasPlace).toBe(true);
            expect(hasRestaurant).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
