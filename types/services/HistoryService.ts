/**
 * History Service
 * 
 * Manages retrieval and storage of itinerary history for users.
 * Implements authorization checks to ensure users only access their own data.
 */

import { Itinerary } from '@/types';
import { IItineraryRepository, itineraryRepository as defaultItineraryRepository } from '@/lib/db/repositories';

export interface IHistoryService {
  saveItinerary(userId: string, itinerary: Omit<Itinerary, 'id' | 'generatedAt'>): Promise<Itinerary>;
  getItineraryHistory(userId: string): Promise<Itinerary[]>;
  getItineraryById(userId: string, itineraryId: string): Promise<Itinerary | null>;
}

export class HistoryService implements IHistoryService {
  private itineraryRepository: IItineraryRepository;

  constructor(itineraryRepository?: IItineraryRepository) {
    this.itineraryRepository = itineraryRepository || defaultItineraryRepository;
  }

  /**
   * Save a generated itinerary for a user
   * Requirements: 8.1, 8.2, 8.3
   */
  async saveItinerary(
    userId: string,
    itinerary: Omit<Itinerary, 'id' | 'generatedAt'>
  ): Promise<Itinerary> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Create itinerary with userId association
    const savedItinerary = await this.itineraryRepository.create({
      ...itinerary,
      userId,
    });

    return savedItinerary;
  }

  /**
   * Get all itineraries for a user in reverse chronological order
   * Requirements: 8.4, 8.5, 9.5
   */
  async getItineraryHistory(userId: string): Promise<Itinerary[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Repository already returns itineraries in reverse chronological order
    const itineraries = await this.itineraryRepository.findByUserId(userId);
    
    return itineraries;
  }

  /**
   * Get a specific itinerary by ID with authorization check
   * Requirements: 8.4, 9.5
   */
  async getItineraryById(userId: string, itineraryId: string): Promise<Itinerary | null> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!itineraryId) {
      throw new Error('Itinerary ID is required');
    }

    // Get the itinerary
    const itinerary = await this.itineraryRepository.findById(itineraryId);

    if (!itinerary) {
      return null;
    }

    // Authorization check: ensure the itinerary belongs to the requesting user
    const userItineraries = await this.itineraryRepository.findByUserId(userId);
    const belongsToUser = userItineraries.some(i => i.id === itineraryId);

    if (!belongsToUser) {
      // User is trying to access an itinerary that doesn't belong to them
      return null;
    }

    return itinerary;
  }
}
