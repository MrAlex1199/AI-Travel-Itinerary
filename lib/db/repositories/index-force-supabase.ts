/**
 * Repository Index (Force Supabase)
 * 
 * This version always uses Supabase in development.
 * Use this if environment variables are not loading properly.
 */

import { UserRepositorySupabase } from './UserRepositorySupabase';
import { ItineraryRepositorySupabase } from './ItineraryRepositorySupabase';

export { UserRepository, type IUserRepository } from './UserRepository';
export { ItineraryRepository, type IItineraryRepository } from './ItineraryRepository';
export { UserRepositorySupabase } from './UserRepositorySupabase';
export { ItineraryRepositorySupabase } from './ItineraryRepositorySupabase';

// Force Supabase in development
console.log('🔧 FORCING Supabase repositories');

export const userRepository = new UserRepositorySupabase();
export const itineraryRepository = new ItineraryRepositorySupabase();
