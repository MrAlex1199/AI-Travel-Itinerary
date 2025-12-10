/**
 * Repository Index
 * 
 * Exports all repository implementations for easy access.
 * Supports both in-memory (for testing) and Supabase (for production) implementations.
 */

import { UserRepository } from './UserRepository';
import { ItineraryRepository } from './ItineraryRepository';
import { UserRepositorySupabase } from './UserRepositorySupabase';
import { ItineraryRepositorySupabase } from './ItineraryRepositorySupabase';

export { UserRepository, type IUserRepository } from './UserRepository';
export { ItineraryRepository, type IItineraryRepository } from './ItineraryRepository';
export { UserRepositorySupabase } from './UserRepositorySupabase';
export { ItineraryRepositorySupabase } from './ItineraryRepositorySupabase';

// Force Supabase for development, in-memory for tests only
const IS_TEST = process.env.NODE_ENV === 'test';

// Create singleton instances
// Always use Supabase unless explicitly in test mode
export const userRepository = IS_TEST
  ? new UserRepository()
  : new UserRepositorySupabase();

export const itineraryRepository = IS_TEST
  ? new ItineraryRepository()
  : new ItineraryRepositorySupabase();
