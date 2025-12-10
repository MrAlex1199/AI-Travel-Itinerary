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
vi.mock('@/lib/googleai/client', () => ({
  aiClient: {
    models: {
      generateContent: vi.fn(),
    },
  },
}));

// Mock the genkit config
vi.mock('@/lib/genkit/config', () => ({
  ensureGenkitConfigured: vi.fn(),
}));

describe('ItineraryGenerator', () => {
  let generator: ItineraryGenerator;

  beforeEach(() => {
    generator = new ItineraryGenerator();
    vi.clearAllMocks();
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

  describe('Chronological Sorting', () => {
    it('should sort activities chronologically by time', async () => {
      const { aiClient } = await import('@/lib/googleai/client');
      const input: TripInput = { destination: 'Test City', duration: 1 };
  
      const unsortedActivities = [
        { time: '14:00', name: 'Afternoon Activity', location: 'Museum', description: '...' },
        { time: '09:00', name: 'Morning Activity', location: 'Park', description: '...' },
        { time: '12:00', name: 'Lunch', location: 'Restaurant', description: '...' },
      ];
  
      const mockResponse = {
        dailySchedules: [{
          day: 1,
          activities: unsortedActivities,
        }],
        recommendations: [],
      };
  
      vi.mocked(aiClient.models.generateContent).mockResolvedValue({
        text: JSON.stringify(mockResponse),
      } as any);
  
      const itinerary = await generator.generateItinerary(input, 'en');
  
      const sortedTimes = itinerary.dailySchedules[0].activities.map(a => a.time);
      expect(sortedTimes).toEqual(['09:00', '12:00', '14:00']);
    });
  });

  describe('Property-Based Tests', () => {
    // Feature: ai-travel-itinerary, Property 4: Generated itineraries match requested duration
    it('Property 4: generated itineraries match requested duration', async () => {
      const { aiClient } = await import('@/lib/googleai/client');

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

            vi.mocked(aiClient.models.generateContent).mockResolvedValue({
              text: JSON.stringify(mockResponse),
            } as any);

            // Generate itinerary
            const input: TripInput = { destination, duration };
            const itinerary = await generator.generateItinerary(input, 'th');

            // Property: The number of daily schedules should match the requested duration
            expect(itinerary.dailySchedules.length).toBe(duration);
          }
        ),
        { numRuns: 10 }
      );
    });

    // Feature: ai-travel-itinerary, Property 5: Each daily schedule contains minimum activities
    it('Property 5: each daily schedule contains minimum activities', async () => {
      const { aiClient } = await import('@/lib/googleai/client');

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

            vi.mocked(aiClient.models.generateContent).mockResolvedValue({
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
        { numRuns: 10 }
      );
    });

    // Feature: ai-travel-itinerary, Property 6: Successful generation returns complete itinerary
    it('Property 6: successful generation returns complete itinerary', async () => {
      const { aiClient } = await import('@/lib/googleai/client');

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

            vi.mocked(aiClient.models.generateContent).mockResolvedValue({
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
        { numRuns: 10 }
      );
    });
  });
});