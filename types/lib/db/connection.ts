/**
 * Database Connection Utilities
 * 
 * This module provides database connection management.
 * Currently implements an in-memory database for development.
 * Can be replaced with PostgreSQL connection pool in production.
 */

import { User, Itinerary, DailySchedule, Activity, Recommendation, AuthSession } from '@/types';

export interface Database {
  users: Map<string, User>;
  itineraries: Map<string, Itinerary>;
  sessions: Map<string, AuthSession>;
  // Helper indexes for efficient queries
  userItineraries: Map<string, string[]>; // userId -> itineraryIds[]
}

// In-memory database instance
let db: Database | null = null;

/**
 * Initialize the database connection
 */
export function initDatabase(): Database {
  if (!db) {
    db = {
      users: new Map(),
      itineraries: new Map(),
      sessions: new Map(),
      userItineraries: new Map(),
    };
  }
  return db;
}

/**
 * Get the database instance
 */
export function getDatabase(): Database {
  if (!db) {
    return initDatabase();
  }
  return db;
}

/**
 * Close database connection (for cleanup in tests)
 */
export function closeDatabase(): void {
  db = null;
}

/**
 * Clear all data from database (useful for testing)
 */
export function clearDatabase(): void {
  if (db) {
    db.users.clear();
    db.itineraries.clear();
    db.sessions.clear();
    db.userItineraries.clear();
  }
}

/**
 * Generate a UUID v4
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
