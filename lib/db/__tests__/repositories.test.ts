/**
 * Repository Tests
 * 
 * Basic tests to verify repository implementations work correctly.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { clearDatabase, initDatabase } from '../connection';
import { userRepository, itineraryRepository } from '../repositories';
import { DailySchedule, Recommendation, Activity, Itinerary } from '@/types';
import * as fc from 'fast-check';

describe('UserRepository', () => {
  beforeEach(() => {
    clearDatabase();
    initDatabase();
  });

  it('should create a new user', async () => {
    const user = await userRepository.create('test@example.com', 'hashedpassword');
    
    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
    expect(user.passwordHash).toBe('hashedpassword');
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it('should find user by id', async () => {
    const created = await userRepository.create('test@example.com', 'hashedpassword');
    const found = await userRepository.findById(created.id);
    
    expect(found).not.toBeNull();
    expect(found?.email).toBe('test@example.com');
  });

  it('should find user by email', async () => {
    await userRepository.create('test@example.com', 'hashedpassword');
    const found = await userRepository.findByEmail('test@example.com');
    
    expect(found).not.toBeNull();
    expect(found?.email).toBe('test@example.com');
  });

  it('should throw error when creating user with duplicate email', async () => {
    await userRepository.create('test@example.com', 'hashedpassword');
    
    await expect(
      userRepository.create('test@example.com', 'anotherpassword')
    ).rejects.toThrow('Email already exists');
  });

  it('should update user', async () => {
    const user = await userRepository.create('test@example.com', 'hashedpassword');
    
    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const updated = await userRepository.update(user.id, { email: 'updated@example.com' });
    
    expect(updated).not.toBeNull();
    expect(updated?.email).toBe('updated@example.com');
    expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(user.updatedAt.getTime());
  });

  it('should delete user', async () => {
    const user = await userRepository.create('test@example.com', 'hashedpassword');
    const deleted = await userRepository.delete(user.id);
    
    expect(deleted).toBe(true);
    
    const found = await userRepository.findById(user.id);
    expect(found).toBeNull();
  });
});

describe('ItineraryRepository', () => {
  let userId: string;

  beforeEach(async () => {
    clearDatabase();
    initDatabase();
    const user = await userRepository.create('test@example.com', 'hashedpassword');
    userId = user.id;
  });

  it('should create a new itinerary', async () => {
    const dailySchedules: DailySchedule[] = [
      {
        day: 1,
        activities: [
          {
            time: '09:00',
            name: 'Visit Temple',
            location: 'Bangkok',
            description: 'Beautiful temple',
          },
        ],
      },
    ];

    const recommendations: Recommendation[] = [
      {
        id: '1',
        category: 'place',
        name: 'Grand Palace',
        description: 'Historic palace',
      },
    ];

    const itinerary = await itineraryRepository.create({
      userId,
      destination: 'Bangkok',
      duration: 3,
      dailySchedules,
      recommendations,
    });

    expect(itinerary.id).toBeDefined();
    expect(itinerary.destination).toBe('Bangkok');
    expect(itinerary.duration).toBe(3);
    expect(itinerary.dailySchedules).toHaveLength(1);
    expect(itinerary.recommendations).toHaveLength(1);
    expect(itinerary.generatedAt).toBeInstanceOf(Date);
  });

  it('should find itinerary by id', async () => {
    const created = await itineraryRepository.create({
      userId,
      destination: 'Bangkok',
      duration: 3,
      dailySchedules: [],
      recommendations: [],
    });

    const found = await itineraryRepository.findById(created.id);
    
    expect(found).not.toBeNull();
    expect(found?.destination).toBe('Bangkok');
  });

  it('should find itineraries by user id', async () => {
    await itineraryRepository.create({
      userId,
      destination: 'Bangkok',
      duration: 3,
      dailySchedules: [],
      recommendations: [],
    });

    await itineraryRepository.create({
      userId,
      destination: 'Phuket',
      duration: 5,
      dailySchedules: [],
      recommendations: [],
    });

    const itineraries = await itineraryRepository.findByUserId(userId);
    
    expect(itineraries).toHaveLength(2);
  });

  it('should return itineraries in reverse chronological order', async () => {
    const first = await itineraryRepository.create({
      userId,
      destination: 'Bangkok',
      duration: 3,
      dailySchedules: [],
      recommendations: [],
    });

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const second = await itineraryRepository.create({
      userId,
      destination: 'Phuket',
      duration: 5,
      dailySchedules: [],
      recommendations: [],
    });

    const itineraries = await itineraryRepository.findByUserId(userId);
    
    expect(itineraries[0].id).toBe(second.id);
    expect(itineraries[1].id).toBe(first.id);
  });

  it('should delete itinerary', async () => {
    const itinerary = await itineraryRepository.create({
      userId,
      destination: 'Bangkok',
      duration: 3,
      dailySchedules: [],
      recommendations: [],
    });

    const deleted = await itineraryRepository.delete(itinerary.id);
    
    expect(deleted).toBe(true);
    
    const found = await itineraryRepository.findById(itinerary.id);
    expect(found).toBeNull();
  });

  // Feature: ai-travel-itinerary, Property 20: Stored itineraries include timestamps
  // Validates: Requirements 8.3
  it('property test: stored itineraries include timestamps', async () => {
    // Custom arbitraries for generating test data
    const arbitraryActivity = (): fc.Arbitrary<Activity> => {
      return fc.record({
        time: fc.oneof(
          fc.constantFrom('09:00', '10:30', '12:00', '14:00', '16:30', '18:00', '20:00'),
          fc.tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }))
            .map(([h, m]) => `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
        ),
        name: fc.string({ minLength: 1, maxLength: 100 }),
        location: fc.string({ minLength: 1, maxLength: 100 }),
        description: fc.string({ minLength: 1, maxLength: 500 }),
        icon: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
      });
    };

    const arbitraryDailySchedule = (): fc.Arbitrary<DailySchedule> => {
      return fc.record({
        day: fc.integer({ min: 1, max: 30 }),
        activities: fc.array(arbitraryActivity(), { minLength: 1, maxLength: 10 }),
      });
    };

    const arbitraryRecommendation = (): fc.Arbitrary<Recommendation> => {
      return fc.record({
        id: fc.uuid(),
        category: fc.constantFrom('place', 'restaurant', 'experience') as fc.Arbitrary<'place' | 'restaurant' | 'experience'>,
        name: fc.string({ minLength: 1, maxLength: 100 }),
        description: fc.string({ minLength: 1, maxLength: 500 }),
        location: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
      });
    };

    const arbitraryItineraryData = () => {
      return fc.record({
        destination: fc.string({ minLength: 1, maxLength: 100 }),
        duration: fc.integer({ min: 1, max: 30 }),
        dailySchedules: fc.array(arbitraryDailySchedule(), { minLength: 0, maxLength: 30 }),
        recommendations: fc.array(arbitraryRecommendation(), { minLength: 0, maxLength: 20 }),
      });
    };

    await fc.assert(
      fc.asyncProperty(arbitraryItineraryData(), async (itineraryData) => {
        const beforeSave = new Date();
        
        // Save the itinerary to the database
        const saved = await itineraryRepository.create({
          userId,
          ...itineraryData,
        });

        const afterSave = new Date();

        // Property: Stored itineraries must include a timestamp
        expect(saved.generatedAt).toBeInstanceOf(Date);
        expect(saved.generatedAt.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
        expect(saved.generatedAt.getTime()).toBeLessThanOrEqual(afterSave.getTime());

        // Verify the timestamp persists when retrieved
        const retrieved = await itineraryRepository.findById(saved.id);
        expect(retrieved).not.toBeNull();
        expect(retrieved!.generatedAt).toBeInstanceOf(Date);
        expect(retrieved!.generatedAt.getTime()).toBe(saved.generatedAt.getTime());
      }),
      { numRuns: 100 }
    );
  });

  // Feature: ai-travel-itinerary, Property 19: Itinerary storage round-trip
  // Validates: Requirements 8.1, 8.2, 9.2
  it('property test: itinerary storage round-trip', async () => {
    // Custom arbitraries for generating test data
    const arbitraryActivity = (): fc.Arbitrary<Activity> => {
      return fc.record({
        time: fc.oneof(
          fc.constantFrom('09:00', '10:30', '12:00', '14:00', '16:30', '18:00', '20:00'),
          fc.tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }))
            .map(([h, m]) => `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
        ),
        name: fc.string({ minLength: 1, maxLength: 100 }),
        location: fc.string({ minLength: 1, maxLength: 100 }),
        description: fc.string({ minLength: 1, maxLength: 500 }),
        icon: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
      });
    };

    const arbitraryDailySchedule = (): fc.Arbitrary<DailySchedule> => {
      return fc.record({
        day: fc.integer({ min: 1, max: 30 }),
        activities: fc.array(arbitraryActivity(), { minLength: 1, maxLength: 10 }),
      });
    };

    const arbitraryRecommendation = (): fc.Arbitrary<Recommendation> => {
      return fc.record({
        id: fc.uuid(),
        category: fc.constantFrom('place', 'restaurant', 'experience') as fc.Arbitrary<'place' | 'restaurant' | 'experience'>,
        name: fc.string({ minLength: 1, maxLength: 100 }),
        description: fc.string({ minLength: 1, maxLength: 500 }),
        location: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
      });
    };

    const arbitraryItineraryData = () => {
      return fc.record({
        destination: fc.string({ minLength: 1, maxLength: 100 }),
        duration: fc.integer({ min: 1, max: 30 }),
        dailySchedules: fc.array(arbitraryDailySchedule(), { minLength: 0, maxLength: 30 }),
        recommendations: fc.array(arbitraryRecommendation(), { minLength: 0, maxLength: 20 }),
      });
    };

    await fc.assert(
      fc.asyncProperty(arbitraryItineraryData(), async (itineraryData) => {
        // Save the itinerary to the database
        const saved = await itineraryRepository.create({
          userId,
          ...itineraryData,
        });

        // Retrieve it by ID
        const retrieved = await itineraryRepository.findById(saved.id);

        // Verify the round-trip: retrieved data should match saved data
        expect(retrieved).not.toBeNull();
        expect(retrieved!.id).toBe(saved.id);
        expect(retrieved!.destination).toBe(itineraryData.destination);
        expect(retrieved!.duration).toBe(itineraryData.duration);
        
        // Verify daily schedules
        expect(retrieved!.dailySchedules).toHaveLength(itineraryData.dailySchedules.length);
        for (let i = 0; i < itineraryData.dailySchedules.length; i++) {
          const originalSchedule = itineraryData.dailySchedules[i];
          const retrievedSchedule = retrieved!.dailySchedules[i];
          
          expect(retrievedSchedule.day).toBe(originalSchedule.day);
          expect(retrievedSchedule.activities).toHaveLength(originalSchedule.activities.length);
          
          for (let j = 0; j < originalSchedule.activities.length; j++) {
            const originalActivity = originalSchedule.activities[j];
            const retrievedActivity = retrievedSchedule.activities[j];
            
            expect(retrievedActivity.time).toBe(originalActivity.time);
            expect(retrievedActivity.name).toBe(originalActivity.name);
            expect(retrievedActivity.location).toBe(originalActivity.location);
            expect(retrievedActivity.description).toBe(originalActivity.description);
            expect(retrievedActivity.icon).toBe(originalActivity.icon);
          }
        }
        
        // Verify recommendations
        expect(retrieved!.recommendations).toHaveLength(itineraryData.recommendations.length);
        for (let i = 0; i < itineraryData.recommendations.length; i++) {
          const originalRec = itineraryData.recommendations[i];
          const retrievedRec = retrieved!.recommendations[i];
          
          expect(retrievedRec.id).toBe(originalRec.id);
          expect(retrievedRec.category).toBe(originalRec.category);
          expect(retrievedRec.name).toBe(originalRec.name);
          expect(retrievedRec.description).toBe(originalRec.description);
          expect(retrievedRec.location).toBe(originalRec.location);
        }
        
        // Verify timestamp exists
        expect(retrieved!.generatedAt).toBeInstanceOf(Date);
      }),
      { numRuns: 100 }
    );
  });
});
