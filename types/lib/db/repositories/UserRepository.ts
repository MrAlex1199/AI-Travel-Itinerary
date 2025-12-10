/**
 * User Repository
 * 
 * Handles all database operations related to users.
 * Implements the repository pattern for data access abstraction.
 */

import { User } from '@/types';
import { getDatabase, generateId } from '../connection';

export interface IUserRepository {
  create(email: string, passwordHash: string): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, updates: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
  /**
   * Create a new user
   */
  async create(email: string, passwordHash: string): Promise<User> {
    const db = getDatabase();
    
    // Check if email already exists
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new Error('Email already exists');
    }

    const now = new Date();
    const user: User = {
      id: generateId(),
      email,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };

    db.users.set(user.id, user);
    return user;
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const db = getDatabase();
    const user = db.users.get(id);
    return user || null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const db = getDatabase();
    
    const users = Array.from(db.users.values());
    for (const user of users) {
      if (user.email === email) {
        return user;
      }
    }
    
    return null;
  }

  /**
   * Update user
   */
  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const db = getDatabase();
    const user = db.users.get(id);
    
    if (!user) {
      return null;
    }

    const updatedUser: User = {
      ...user,
      ...updates,
      id: user.id, // Prevent ID from being changed
      updatedAt: new Date(),
    };

    db.users.set(id, updatedUser);
    return updatedUser;
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    const db = getDatabase();
    return db.users.delete(id);
  }
}
