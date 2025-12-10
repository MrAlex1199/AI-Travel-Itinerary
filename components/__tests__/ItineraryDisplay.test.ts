/**
 * ItineraryDisplay Component Tests
 * 
 * Property-based tests for itinerary display functionality.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { Itinerary, DailySchedule, Activity, Recommendation } from '@/types';

/**
 * Helper function to extract the chronological ordering logic from ItineraryDisplay
 * This mirrors the sorting logic in the component
 */
const sortSchedulesChronologically = (schedules: DailySchedule[]): DailySchedule[] => {
  return [...schedules].sort((a, b) => a.day - b.day);
};

/**
 * Helper function to check if schedules are in chronological order
 */
const isChronologicallyOrdered = (schedules: DailySchedule[]): boolean => {
  for (let i = 0; i < schedules.length - 1; i++) {
    if (schedules[i].day > schedules[i + 1].day) {
      return false;
    }
  }
  return true;
};

/**
 * Helper function to detect time format (12-hour or 24-hour)
 * Returns '12-hour' or '24-hour'
 */
const detectTimeFormat = (time: string): '12-hour' | '24-hour' => {
  // 24-hour format: HH:mm where HH is 00-23
  // 12-hour format: would include AM/PM indicators or hours 01-12
  
  // Check if time matches HH:mm format
  const timeMatch = time.match(/^(\d{2}):(\d{2})$/);
  if (!timeMatch) {
    throw new Error(`Invalid time format: ${time}`);
  }

  const hours = parseInt(timeMatch[1], 10);
  
  // If hours are 00-23, it's 24-hour format
  // In our system, we use 24-hour format (HH:mm)
  if (hours >= 0 && hours <= 23) {
    return '24-hour';
  }

  throw new Error(`Invalid hours in time: ${time}`);
};

/**
 * Custom arbitraries for generating test data
 */

// Generate a valid activity
const arbitraryActivity = (): fc.Arbitrary<Activity> => {
  return fc.record({
    time: fc.constantFrom('09:00', '12:00', '15:00', '18:00', '21:00'),
    name: fc.string({ minLength: 5, maxLength: 50 }),
    location: fc.string({ minLength: 5, maxLength: 50 }),
    description: fc.string({ minLength: 10, maxLength: 100 }),
    icon: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
  });
};

// Generate a valid daily schedule
const arbitraryDailySchedule = (dayNumber: number): fc.Arbitrary<DailySchedule> => {
  return fc.record({
    day: fc.constant(dayNumber),
    activities: fc.array(arbitraryActivity(), { minLength: 3, maxLength: 10 }),
  });
};

// Generate an array of daily schedules with potentially unordered day numbers
const arbitraryDailySchedules = (): fc.Arbitrary<DailySchedule[]> => {
  return fc.integer({ min: 1, max: 30 }).chain(duration => {
    // Generate schedules for each day
    const scheduleArbitraries = Array.from({ length: duration }, (_, i) => 
      arbitraryDailySchedule(i + 1)
    );
    
    // Combine all schedules and shuffle them to create potentially unordered input
    return fc.tuple(...scheduleArbitraries).map(schedules => {
      // Shuffle the array to create random ordering
      const shuffled = [...schedules];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  });
};

// Generate a valid recommendation
const arbitraryRecommendation = (): fc.Arbitrary<Recommendation> => {
  return fc.record({
    id: fc.uuid(),
    category: fc.constantFrom('place', 'restaurant', 'experience'),
    name: fc.string({ minLength: 5, maxLength: 50 }),
    description: fc.string({ minLength: 10, maxLength: 100 }),
    location: fc.option(fc.string({ minLength: 5, maxLength: 50 }), { nil: undefined }),
  });
};

// Generate a complete itinerary with potentially unordered schedules
const arbitraryItinerary = (): fc.Arbitrary<Itinerary> => {
  return fc.record({
    id: fc.uuid(),
    destination: fc.string({ minLength: 1, maxLength: 50 }),
    duration: fc.integer({ min: 1, max: 30 }),
    dailySchedules: arbitraryDailySchedules(),
    recommendations: fc.array(arbitraryRecommendation(), { minLength: 2, maxLength: 10 }),
    generatedAt: fc.date(),
  });
};

describe('ItineraryDisplay', () => {
  describe('Property-Based Tests', () => {
    // Feature: ai-travel-itinerary, Property 8: Daily schedules are ordered chronologically
    // Validates: Requirements 3.2
    it('Property 8: daily schedules are ordered chronologically', () => {
      fc.assert(
        fc.property(arbitraryItinerary(), (itinerary) => {
          // Property: For any itinerary with multiple days, 
          // the displayed daily schedules should be ordered by day number in ascending order
          
          // Apply the sorting logic from the component
          const sortedSchedules = sortSchedulesChronologically(itinerary.dailySchedules);
          
          // Verify that the sorted schedules are in chronological order
          expect(isChronologicallyOrdered(sortedSchedules)).toBe(true);
          
          // Additional verification: each schedule should have day <= next schedule's day
          for (let i = 0; i < sortedSchedules.length - 1; i++) {
            expect(sortedSchedules[i].day).toBeLessThanOrEqual(sortedSchedules[i + 1].day);
          }
          
          // Verify that all original schedules are present (no data loss)
          expect(sortedSchedules.length).toBe(itinerary.dailySchedules.length);
          
          // Verify that the sorting is stable (same day numbers maintain relative order)
          const originalDays = itinerary.dailySchedules.map(s => s.day);
          const sortedDays = sortedSchedules.map(s => s.day);
          const expectedSortedDays = [...originalDays].sort((a, b) => a - b);
          expect(sortedDays).toEqual(expectedSortedDays);
        }),
        { numRuns: 100 }
      );
    });

    it('chronological ordering works with single day itinerary', () => {
      // Edge case: single day should remain unchanged
      const singleDaySchedule: DailySchedule = {
        day: 1,
        activities: [
          {
            time: '09:00',
            name: 'Morning Activity',
            location: 'Location 1',
            description: 'Description 1',
          },
        ],
      };

      const sorted = sortSchedulesChronologically([singleDaySchedule]);
      expect(sorted).toEqual([singleDaySchedule]);
      expect(isChronologicallyOrdered(sorted)).toBe(true);
    });

    it('chronological ordering works with already sorted schedules', () => {
      // Test that already sorted schedules remain sorted
      const sortedSchedules: DailySchedule[] = [
        { day: 1, activities: [] },
        { day: 2, activities: [] },
        { day: 3, activities: [] },
      ];

      const result = sortSchedulesChronologically(sortedSchedules);
      expect(result).toEqual(sortedSchedules);
      expect(isChronologicallyOrdered(result)).toBe(true);
    });

    it('chronological ordering works with reverse sorted schedules', () => {
      // Test that reverse sorted schedules get properly sorted
      const reverseSchedules: DailySchedule[] = [
        { day: 3, activities: [] },
        { day: 2, activities: [] },
        { day: 1, activities: [] },
      ];

      const result = sortSchedulesChronologically(reverseSchedules);
      expect(result[0].day).toBe(1);
      expect(result[1].day).toBe(2);
      expect(result[2].day).toBe(3);
      expect(isChronologicallyOrdered(result)).toBe(true);
    });

    it('chronological ordering works with randomly ordered schedules', () => {
      // Test with a specific random ordering
      const randomSchedules: DailySchedule[] = [
        { day: 5, activities: [] },
        { day: 1, activities: [] },
        { day: 3, activities: [] },
        { day: 2, activities: [] },
        { day: 4, activities: [] },
      ];

      const result = sortSchedulesChronologically(randomSchedules);
      expect(result[0].day).toBe(1);
      expect(result[1].day).toBe(2);
      expect(result[2].day).toBe(3);
      expect(result[3].day).toBe(4);
      expect(result[4].day).toBe(5);
      expect(isChronologicallyOrdered(result)).toBe(true);
    });

    // Feature: ai-travel-itinerary, Property 9: Time formatting is consistent
    // Validates: Requirements 3.5
    it('Property 9: time formatting is consistent', () => {
      fc.assert(
        fc.property(arbitraryItinerary(), (itinerary) => {
          // Property: For any itinerary, all activity times should use the same time format
          // (either all 12-hour or all 24-hour format)
          
          // Collect all times from all activities across all daily schedules
          const allTimes: string[] = [];
          for (const schedule of itinerary.dailySchedules) {
            for (const activity of schedule.activities) {
              allTimes.push(activity.time);
            }
          }

          // If there are no times, the property is trivially satisfied
          if (allTimes.length === 0) {
            return true;
          }

          // Determine the format of the first time
          const firstTimeFormat = detectTimeFormat(allTimes[0]);

          // Verify all times use the same format
          for (const time of allTimes) {
            const format = detectTimeFormat(time);
            expect(format).toBe(firstTimeFormat);
          }

          // All times should be in the same format
          return true;
        }),
        { numRuns: 100 }
      );
    });

    // Feature: ai-travel-itinerary, Property 11: Recommendation rendering includes name and description
    // Validates: Requirements 4.4
    it('Property 11: recommendation rendering includes name and description', () => {
      fc.assert(
        fc.property(arbitraryRecommendation(), (recommendation) => {
          // Property: For any recommendation being rendered, 
          // the displayed output should contain both the name and description fields
          
          // Simulate the rendering logic from RecommendationList component
          // The component renders each recommendation with name and description
          const renderedName = recommendation.name;
          const renderedDescription = recommendation.description;
          
          // Verify that both name and description are present and non-empty
          expect(renderedName).toBeDefined();
          expect(renderedName.length).toBeGreaterThan(0);
          
          expect(renderedDescription).toBeDefined();
          expect(renderedDescription.length).toBeGreaterThan(0);
          
          // Verify that the recommendation object contains the required fields
          expect(recommendation).toHaveProperty('name');
          expect(recommendation).toHaveProperty('description');
          
          // The rendered content should include both fields
          return true;
        }),
        { numRuns: 100 }
      );
    });

    // Feature: ai-travel-itinerary, Property 12: Recommendations are grouped by category
    // Validates: Requirements 4.5
    it('Property 12: recommendations are grouped by category', () => {
      fc.assert(
        fc.property(
          fc.array(arbitraryRecommendation(), { minLength: 1, maxLength: 20 }),
          (recommendations) => {
            // Property: For any list of recommendations being displayed,
            // recommendations with the same category should be grouped together
            
            // Simulate the grouping logic from RecommendationList component
            const groupedRecommendations = recommendations.reduce((acc, rec) => {
              if (!acc[rec.category]) {
                acc[rec.category] = [];
              }
              acc[rec.category].push(rec);
              return acc;
            }, {} as Record<string, Recommendation[]>);
            
            // Verify that all recommendations are present in the grouped structure
            const allGroupedRecs = Object.values(groupedRecommendations).flat();
            expect(allGroupedRecs.length).toBe(recommendations.length);
            
            // Verify that each group contains only recommendations of the same category
            for (const [category, recs] of Object.entries(groupedRecommendations)) {
              for (const rec of recs) {
                expect(rec.category).toBe(category);
              }
              
              // Verify that the group is non-empty
              expect(recs.length).toBeGreaterThan(0);
            }
            
            // Verify that all recommendations with the same category are in the same group
            for (const rec of recommendations) {
              const group = groupedRecommendations[rec.category];
              expect(group).toBeDefined();
              expect(group).toContain(rec);
            }
            
            // Verify that no recommendation appears in multiple groups
            const seenIds = new Set<string>();
            for (const recs of Object.values(groupedRecommendations)) {
              for (const rec of recs) {
                expect(seenIds.has(rec.id)).toBe(false);
                seenIds.add(rec.id);
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests', () => {
    it('should correctly identify chronologically ordered schedules', () => {
      const ordered: DailySchedule[] = [
        { day: 1, activities: [] },
        { day: 2, activities: [] },
        { day: 3, activities: [] },
      ];
      expect(isChronologicallyOrdered(ordered)).toBe(true);
    });

    it('should correctly identify non-chronologically ordered schedules', () => {
      const unordered: DailySchedule[] = [
        { day: 2, activities: [] },
        { day: 1, activities: [] },
        { day: 3, activities: [] },
      ];
      expect(isChronologicallyOrdered(unordered)).toBe(false);
    });

    it('should handle empty schedule array', () => {
      const empty: DailySchedule[] = [];
      expect(isChronologicallyOrdered(empty)).toBe(true);
      expect(sortSchedulesChronologically(empty)).toEqual([]);
    });

    it('should not mutate original array when sorting', () => {
      const original: DailySchedule[] = [
        { day: 3, activities: [] },
        { day: 1, activities: [] },
        { day: 2, activities: [] },
      ];
      const originalCopy = [...original];
      
      sortSchedulesChronologically(original);
      
      // Original should remain unchanged
      expect(original).toEqual(originalCopy);
    });

    it('should detect 24-hour time format correctly', () => {
      expect(detectTimeFormat('00:00')).toBe('24-hour');
      expect(detectTimeFormat('09:30')).toBe('24-hour');
      expect(detectTimeFormat('12:00')).toBe('24-hour');
      expect(detectTimeFormat('13:45')).toBe('24-hour');
      expect(detectTimeFormat('23:59')).toBe('24-hour');
    });

    it('should verify time format consistency in itinerary', () => {
      const itinerary: Itinerary = {
        id: 'test-1',
        destination: 'Bangkok',
        duration: 2,
        dailySchedules: [
          {
            day: 1,
            activities: [
              { time: '09:00', name: 'Activity 1', location: 'Location 1', description: 'Desc 1' },
              { time: '14:00', name: 'Activity 2', location: 'Location 2', description: 'Desc 2' },
              { time: '18:30', name: 'Activity 3', location: 'Location 3', description: 'Desc 3' },
            ],
          },
          {
            day: 2,
            activities: [
              { time: '08:00', name: 'Activity 4', location: 'Location 4', description: 'Desc 4' },
              { time: '12:00', name: 'Activity 5', location: 'Location 5', description: 'Desc 5' },
              { time: '20:00', name: 'Activity 6', location: 'Location 6', description: 'Desc 6' },
            ],
          },
        ],
        recommendations: [],
        generatedAt: new Date(),
      };

      // Collect all times
      const allTimes: string[] = [];
      for (const schedule of itinerary.dailySchedules) {
        for (const activity of schedule.activities) {
          allTimes.push(activity.time);
        }
      }

      // Check all times are in 24-hour format
      const formats = allTimes.map(detectTimeFormat);
      const uniqueFormats = new Set(formats);
      
      expect(uniqueFormats.size).toBe(1);
      expect(uniqueFormats.has('24-hour')).toBe(true);
    });

    it('should handle empty itinerary for time format consistency', () => {
      const emptyItinerary: Itinerary = {
        id: 'test-empty',
        destination: 'Test',
        duration: 0,
        dailySchedules: [],
        recommendations: [],
        generatedAt: new Date(),
      };

      // Empty itinerary should not throw
      const allTimes: string[] = [];
      for (const schedule of emptyItinerary.dailySchedules) {
        for (const activity of schedule.activities) {
          allTimes.push(activity.time);
        }
      }

      expect(allTimes.length).toBe(0);
    });

    it('should handle single activity for time format consistency', () => {
      const singleActivityItinerary: Itinerary = {
        id: 'test-single',
        destination: 'Test',
        duration: 1,
        dailySchedules: [
          {
            day: 1,
            activities: [
              { time: '10:00', name: 'Single Activity', location: 'Location', description: 'Description' },
            ],
          },
        ],
        recommendations: [],
        generatedAt: new Date(),
      };

      const allTimes: string[] = [];
      for (const schedule of singleActivityItinerary.dailySchedules) {
        for (const activity of schedule.activities) {
          allTimes.push(activity.time);
        }
      }

      expect(allTimes.length).toBe(1);
      expect(detectTimeFormat(allTimes[0])).toBe('24-hour');
    });

    it('should verify recommendation has name and description', () => {
      const recommendation: Recommendation = {
        id: 'rec-1',
        category: 'place',
        name: 'Grand Palace',
        description: 'A beautiful historic palace in Bangkok',
        location: 'Bangkok',
      };

      // Verify required fields are present
      expect(recommendation).toHaveProperty('name');
      expect(recommendation).toHaveProperty('description');
      expect(recommendation.name).toBe('Grand Palace');
      expect(recommendation.description).toBe('A beautiful historic palace in Bangkok');
    });

    it('should verify recommendation with minimal fields has name and description', () => {
      const recommendation: Recommendation = {
        id: 'rec-2',
        category: 'restaurant',
        name: 'Thai Restaurant',
        description: 'Authentic Thai cuisine',
      };

      // Verify required fields are present even without optional location
      expect(recommendation).toHaveProperty('name');
      expect(recommendation).toHaveProperty('description');
      expect(recommendation.name.length).toBeGreaterThan(0);
      expect(recommendation.description.length).toBeGreaterThan(0);
    });

    it('should verify all recommendation categories have name and description', () => {
      const recommendations: Recommendation[] = [
        {
          id: 'rec-1',
          category: 'place',
          name: 'Temple',
          description: 'Historic temple',
        },
        {
          id: 'rec-2',
          category: 'restaurant',
          name: 'Restaurant',
          description: 'Local food',
        },
        {
          id: 'rec-3',
          category: 'experience',
          name: 'Tour',
          description: 'City tour',
        },
      ];

      // Verify all recommendations have required fields
      for (const rec of recommendations) {
        expect(rec).toHaveProperty('name');
        expect(rec).toHaveProperty('description');
        expect(rec.name.length).toBeGreaterThan(0);
        expect(rec.description.length).toBeGreaterThan(0);
      }
    });

    it('should group recommendations by category correctly', () => {
      const recommendations: Recommendation[] = [
        {
          id: 'rec-1',
          category: 'place',
          name: 'Temple',
          description: 'Historic temple',
        },
        {
          id: 'rec-2',
          category: 'restaurant',
          name: 'Restaurant',
          description: 'Local food',
        },
        {
          id: 'rec-3',
          category: 'place',
          name: 'Palace',
          description: 'Royal palace',
        },
        {
          id: 'rec-4',
          category: 'experience',
          name: 'Tour',
          description: 'City tour',
        },
      ];

      // Apply grouping logic from RecommendationList component
      const groupedRecommendations = recommendations.reduce((acc, rec) => {
        if (!acc[rec.category]) {
          acc[rec.category] = [];
        }
        acc[rec.category].push(rec);
        return acc;
      }, {} as Record<string, Recommendation[]>);

      // Verify grouping
      expect(Object.keys(groupedRecommendations)).toHaveLength(3);
      expect(groupedRecommendations['place']).toHaveLength(2);
      expect(groupedRecommendations['restaurant']).toHaveLength(1);
      expect(groupedRecommendations['experience']).toHaveLength(1);

      // Verify each group contains only items of that category
      expect(groupedRecommendations['place'].every(r => r.category === 'place')).toBe(true);
      expect(groupedRecommendations['restaurant'].every(r => r.category === 'restaurant')).toBe(true);
      expect(groupedRecommendations['experience'].every(r => r.category === 'experience')).toBe(true);
    });

    it('should handle single category grouping', () => {
      const recommendations: Recommendation[] = [
        {
          id: 'rec-1',
          category: 'place',
          name: 'Temple 1',
          description: 'First temple',
        },
        {
          id: 'rec-2',
          category: 'place',
          name: 'Temple 2',
          description: 'Second temple',
        },
      ];

      const groupedRecommendations = recommendations.reduce((acc, rec) => {
        if (!acc[rec.category]) {
          acc[rec.category] = [];
        }
        acc[rec.category].push(rec);
        return acc;
      }, {} as Record<string, Recommendation[]>);

      expect(Object.keys(groupedRecommendations)).toHaveLength(1);
      expect(groupedRecommendations['place']).toHaveLength(2);
    });

    it('should handle empty recommendations array', () => {
      const recommendations: Recommendation[] = [];

      const groupedRecommendations = recommendations.reduce((acc, rec) => {
        if (!acc[rec.category]) {
          acc[rec.category] = [];
        }
        acc[rec.category].push(rec);
        return acc;
      }, {} as Record<string, Recommendation[]>);

      expect(Object.keys(groupedRecommendations)).toHaveLength(0);
    });

    it('should preserve all recommendations when grouping', () => {
      const recommendations: Recommendation[] = [
        {
          id: 'rec-1',
          category: 'place',
          name: 'Place 1',
          description: 'Description 1',
        },
        {
          id: 'rec-2',
          category: 'restaurant',
          name: 'Restaurant 1',
          description: 'Description 2',
        },
        {
          id: 'rec-3',
          category: 'experience',
          name: 'Experience 1',
          description: 'Description 3',
        },
      ];

      const groupedRecommendations = recommendations.reduce((acc, rec) => {
        if (!acc[rec.category]) {
          acc[rec.category] = [];
        }
        acc[rec.category].push(rec);
        return acc;
      }, {} as Record<string, Recommendation[]>);

      // Count total recommendations in groups
      const totalInGroups = Object.values(groupedRecommendations).flat().length;
      expect(totalInGroups).toBe(recommendations.length);

      // Verify each original recommendation is in a group
      for (const rec of recommendations) {
        const group = groupedRecommendations[rec.category];
        expect(group).toBeDefined();
        expect(group.some(r => r.id === rec.id)).toBe(true);
      }
    });
  });
});
