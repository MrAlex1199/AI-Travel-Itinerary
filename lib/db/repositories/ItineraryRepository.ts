/**
 * Itinerary Repository
 * 
 * Handles all database operations related to itineraries.
 * Implements the repository pattern for data access abstraction.
 */

import { Itinerary, DailySchedule, Activity, Recommendation } from '@/types';
import { getDatabase, generateId } from '../connection';

export interface IItineraryRepository {
  create(itinerary: Omit<Itinerary, 'id' | 'generatedAt'> & { userId: string }): Promise<Itinerary>;
  findById(id: string): Promise<Itinerary | null>;
  findByUserId(userId: string): Promise<Itinerary[]>;
  delete(id: string): Promise<boolean>;
}

export class ItineraryRepository implements IItineraryRepository {
  /**
   * Create a new itinerary
   */
  async create(
    data: Omit<Itinerary, 'id' | 'generatedAt'> & { userId: string }
  ): Promise<Itinerary> {
    const db = getDatabase();

    const itinerary: Itinerary = {
      id: generateId(),
      destination: data.destination,
      duration: data.duration,
      dailySchedules: data.dailySchedules,
      recommendations: data.recommendations,
      generatedAt: new Date(),
    };

    // Store itinerary
    db.itineraries.set(itinerary.id, itinerary);

    // Update user itineraries index
    const userItineraries = db.userItineraries.get(data.userId) || [];
    userItineraries.push(itinerary.id);
    db.userItineraries.set(data.userId, userItineraries);

    return itinerary;
  }

  /**
   * Find itinerary by ID
   */
  async findById(id: string): Promise<Itinerary | null> {
    const db = getDatabase();
    const itinerary = db.itineraries.get(id);
    return itinerary || null;
  }

  /**
   * Find all itineraries for a user
   * Returns itineraries in reverse chronological order (newest first)
   */
  async findByUserId(userId: string): Promise<Itinerary[]> {
    const db = getDatabase();
    const itineraryIds = db.userItineraries.get(userId) || [];

    const itineraries: Itinerary[] = [];
    for (const id of itineraryIds) {
      const itinerary = db.itineraries.get(id);
      if (itinerary) {
        itineraries.push(itinerary);
      }
    }

    // Sort by generatedAt in descending order (newest first)
    return itineraries.sort((a, b) => {
      return b.generatedAt.getTime() - a.generatedAt.getTime();
    });
  }

  /**
   * Delete itinerary
   */
  async delete(id: string): Promise<boolean> {
    const db = getDatabase();
    
    // Remove from itineraries map
    const deleted = db.itineraries.delete(id);

    // Remove from user itineraries index
    if (deleted) {
      const entries = Array.from(db.userItineraries.entries());
      for (const [userId, itineraryIds] of entries) {
        const index = itineraryIds.indexOf(id);
        if (index > -1) {
          itineraryIds.splice(index, 1);
          db.userItineraries.set(userId, itineraryIds);
          break;
        }
      }
    }

    return deleted;
  }
}
