/**
 * History Service Tests
 * 
 * Tests for itinerary history management, storage, and retrieval.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HistoryService } from '../HistoryService';
import { clearDatabase } from '@/lib/db/connection';
import { Itinerary } from '@/types';
import * as fc from 'fast-check';

describe('HistoryService', () => {
  let historyService: HistoryService;

  beforeEach(() => {
    clearDatabase();
    historyService = new HistoryService();
  });

  afterEach(() => {
    clearDatabase();
  });

  describe('saveItinerary', () => {
    it('should save an itinerary for a user', async () => {
      const userId = 'user-123';
      const itineraryData: Omit<Itinerary, 'id' | 'generatedAt'> = {
        destination: 'Bangkok',
        duration: 3,
        dailySchedules: [
          {
            day: 1,
            activities: [
              {
                time: '09:00',
                name: 'Visit Grand Palace',
                location: 'Grand Palace',
                description: 'Explore the historic royal palace',
              },
            ],
          },
        ],
        recommendations: [
          {
            id: 'rec-1',
            category: 'place',
            name: 'Wat Pho',
            description: 'Famous temple with reclining Buddha',
          },
        ],
      };

      const savedItinerary = await historyService.saveItinerary(userId, itineraryData);

      expect(savedItinerary.id).toBeDefined();
      expect(savedItinerary.destination).toBe('Bangkok');
      expect(savedItinerary.duration).toBe(3);
      expect(savedItinerary.generatedAt).toBeInstanceOf(Date);
      expect(savedItinerary.dailySchedules).toHaveLength(1);
      expect(savedItinerary.recommendations).toHaveLength(1);
    });

    it('should throw error if userId is not provided', async () => {
      const itineraryData: Omit<Itinerary, 'id' | 'generatedAt'> = {
        destination: 'Bangkok',
        duration: 3,
        dailySchedules: [],
        recommendations: [],
      };

      await expect(historyService.saveItinerary('', itineraryData)).rejects.toThrow(
        'User ID is required'
      );
    });
  });

  describe('getItineraryHistory', () => {
    it('should return all itineraries for a user in reverse chronological order', async () => {
      const userId = 'user-123';

      // Save multiple itineraries with delays to ensure different timestamps
      const itinerary1 = await historyService.saveItinerary(userId, {
        destination: 'Bangkok',
        duration: 3,
        dailySchedules: [],
        recommendations: [],
      });

      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const itinerary2 = await historyService.saveItinerary(userId, {
        destination: 'Chiang Mai',
        duration: 2,
        dailySchedules: [],
        recommendations: [],
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      const itinerary3 = await historyService.saveItinerary(userId, {
        destination: 'Phuket',
        duration: 5,
        dailySchedules: [],
        recommendations: [],
      });

      const history = await historyService.getItineraryHistory(userId);

      expect(history).toHaveLength(3);
      // Should be in reverse chronological order (newest first)
      expect(history[0].id).toBe(itinerary3.id);
      expect(history[1].id).toBe(itinerary2.id);
      expect(history[2].id).toBe(itinerary1.id);
    });

    it('should return empty array for user with no itineraries', async () => {
      const userId = 'user-with-no-itineraries';

      const history = await historyService.getItineraryHistory(userId);

      expect(history).toEqual([]);
    });

    it('should only return itineraries for the specified user', async () => {
      const user1Id = 'user-1';
      const user2Id = 'user-2';

      // Save itineraries for user 1
      await historyService.saveItinerary(user1Id, {
        destination: 'Bangkok',
        duration: 3,
        dailySchedules: [],
        recommendations: [],
      });

      // Save itineraries for user 2
      await historyService.saveItinerary(user2Id, {
        destination: 'Tokyo',
        duration: 4,
        dailySchedules: [],
        recommendations: [],
      });

      const user1History = await historyService.getItineraryHistory(user1Id);
      const user2History = await historyService.getItineraryHistory(user2Id);

      expect(user1History).toHaveLength(1);
      expect(user1History[0].destination).toBe('Bangkok');

      expect(user2History).toHaveLength(1);
      expect(user2History[0].destination).toBe('Tokyo');
    });

    it('should throw error if userId is not provided', async () => {
      await expect(historyService.getItineraryHistory('')).rejects.toThrow(
        'User ID is required'
      );
    });
  });

  describe('getItineraryById', () => {
    it('should return itinerary if it belongs to the user', async () => {
      const userId = 'user-123';

      const savedItinerary = await historyService.saveItinerary(userId, {
        destination: 'Bangkok',
        duration: 3,
        dailySchedules: [],
        recommendations: [],
      });

      const retrievedItinerary = await historyService.getItineraryById(
        userId,
        savedItinerary.id
      );

      expect(retrievedItinerary).not.toBeNull();
      expect(retrievedItinerary?.id).toBe(savedItinerary.id);
      expect(retrievedItinerary?.destination).toBe('Bangkok');
    });

    it('should return null if itinerary does not belong to the user', async () => {
      const user1Id = 'user-1';
      const user2Id = 'user-2';

      // User 1 saves an itinerary
      const user1Itinerary = await historyService.saveItinerary(user1Id, {
        destination: 'Bangkok',
        duration: 3,
        dailySchedules: [],
        recommendations: [],
      });

      // User 2 tries to access user 1's itinerary
      const retrievedItinerary = await historyService.getItineraryById(
        user2Id,
        user1Itinerary.id
      );

      expect(retrievedItinerary).toBeNull();
    });

    it('should return null if itinerary does not exist', async () => {
      const userId = 'user-123';

      const retrievedItinerary = await historyService.getItineraryById(
        userId,
        'non-existent-id'
      );

      expect(retrievedItinerary).toBeNull();
    });

    it('should throw error if userId is not provided', async () => {
      await expect(
        historyService.getItineraryById('', 'some-id')
      ).rejects.toThrow('User ID is required');
    });

    it('should throw error if itineraryId is not provided', async () => {
      await expect(
        historyService.getItineraryById('user-123', '')
      ).rejects.toThrow('Itinerary ID is required');
    });
  });

  describe('Property-Based Tests', () => {
    // Feature: ai-travel-itinerary, Property 22: History is ordered reverse chronologically
    // Validates: Requirements 8.5, 9.3
    it('Property 22: history is ordered reverse chronologically', async () => {
      // Custom arbitraries for generating test data
      const arbitraryUserId = (): fc.Arbitrary<string> => {
        return fc.uuid();
      };

      const arbitraryItineraryData = () => {
        return fc.record({
          destination: fc.string({ minLength: 1, maxLength: 100 }),
          duration: fc.integer({ min: 1, max: 30 }),
          dailySchedules: fc.constant([]), // Simplified for this test
          recommendations: fc.constant([]), // Simplified for this test
        });
      };

      await fc.assert(
        fc.asyncProperty(
          arbitraryUserId(),
          fc.array(arbitraryItineraryData(), { minLength: 2, maxLength: 10 }),
          async (userId, itinerariesData) => {
            // Clear database before each property test iteration
            clearDatabase();
            const service = new HistoryService();

            // Save itineraries with small delays to ensure different timestamps
            const savedItineraries: Itinerary[] = [];
            for (const itineraryData of itinerariesData) {
              const saved = await service.saveItinerary(userId, itineraryData);
              savedItineraries.push(saved);
              // Small delay to ensure different timestamps
              await new Promise(resolve => setTimeout(resolve, 5));
            }

            // Retrieve history
            const history = await service.getItineraryHistory(userId);

            // Property: History should be ordered by generatedAt in descending order (newest first)
            expect(history).toHaveLength(savedItineraries.length);
            
            for (let i = 0; i < history.length - 1; i++) {
              const current = history[i];
              const next = history[i + 1];
              
              // Current itinerary should have been generated at or after the next one
              expect(current.generatedAt.getTime()).toBeGreaterThanOrEqual(
                next.generatedAt.getTime()
              );
            }

            // Additional check: the first item should be the most recently saved
            // and the last item should be the first saved
            if (history.length > 0) {
              const firstInHistory = history[0];
              const lastInHistory = history[history.length - 1];
              const lastSaved = savedItineraries[savedItineraries.length - 1];
              const firstSaved = savedItineraries[0];

              expect(firstInHistory.id).toBe(lastSaved.id);
              expect(lastInHistory.id).toBe(firstSaved.id);
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 60000); // 60 second timeout for property-based test with multiple database operations

    // Feature: ai-travel-itinerary, Property 21: History retrieval returns only user's itineraries
    // Validates: Requirements 8.4, 9.1, 9.5
    it('Property 21: history retrieval returns only user\'s itineraries', async () => {
      // Custom arbitraries for generating test data
      const arbitraryUserId = (): fc.Arbitrary<string> => {
        return fc.uuid();
      };

      const arbitraryItineraryData = () => {
        return fc.record({
          destination: fc.string({ minLength: 1, maxLength: 100 }),
          duration: fc.integer({ min: 1, max: 30 }),
          dailySchedules: fc.constant([]), // Simplified for this test
          recommendations: fc.constant([]), // Simplified for this test
        });
      };

      await fc.assert(
        fc.asyncProperty(
          arbitraryUserId(),
          arbitraryUserId(),
          fc.array(arbitraryItineraryData(), { minLength: 1, maxLength: 5 }),
          fc.array(arbitraryItineraryData(), { minLength: 1, maxLength: 5 }),
          async (user1Id, user2Id, user1Itineraries, user2Itineraries) => {
            // Ensure users are different
            fc.pre(user1Id !== user2Id);

            // Clear database before each property test iteration
            clearDatabase();
            const service = new HistoryService();

            // Save itineraries for user 1
            const savedUser1Itineraries = [];
            for (const itineraryData of user1Itineraries) {
              const saved = await service.saveItinerary(user1Id, itineraryData);
              savedUser1Itineraries.push(saved);
            }

            // Save itineraries for user 2
            const savedUser2Itineraries = [];
            for (const itineraryData of user2Itineraries) {
              const saved = await service.saveItinerary(user2Id, itineraryData);
              savedUser2Itineraries.push(saved);
            }

            // Retrieve history for user 1
            const user1History = await service.getItineraryHistory(user1Id);

            // Retrieve history for user 2
            const user2History = await service.getItineraryHistory(user2Id);

            // Property: User 1's history should only contain their itineraries
            expect(user1History).toHaveLength(user1Itineraries.length);
            for (const itinerary of user1History) {
              const belongsToUser1 = savedUser1Itineraries.some(
                saved => saved.id === itinerary.id
              );
              expect(belongsToUser1).toBe(true);
            }

            // Property: User 2's history should only contain their itineraries
            expect(user2History).toHaveLength(user2Itineraries.length);
            for (const itinerary of user2History) {
              const belongsToUser2 = savedUser2Itineraries.some(
                saved => saved.id === itinerary.id
              );
              expect(belongsToUser2).toBe(true);
            }

            // Property: No overlap between user histories
            const user1Ids = new Set(user1History.map(i => i.id));
            const user2Ids = new Set(user2History.map(i => i.id));
            
            for (const id of user1Ids) {
              expect(user2Ids.has(id)).toBe(false);
            }
            
            for (const id of user2Ids) {
              expect(user1Ids.has(id)).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 60000); // 60 second timeout for property-based test with multiple database operations
  });
});
