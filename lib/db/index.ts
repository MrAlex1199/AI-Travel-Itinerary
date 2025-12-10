/**
 * Database Module
 * 
 * Main entry point for database operations.
 * Exports connection utilities and repositories.
 */

export {
  initDatabase,
  getDatabase,
  closeDatabase,
  clearDatabase,
  generateId,
  type Database,
} from './connection';

export {
  userRepository,
  itineraryRepository,
  type IUserRepository,
  type IItineraryRepository,
} from './repositories';
