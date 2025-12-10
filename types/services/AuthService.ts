/**
 * Authentication Service
 * 
 * Handles user registration, login, session management, and authorization.
 * Implements password hashing and credential verification.
 */

import bcrypt from 'bcryptjs';
import { User, AuthCredentials, AuthSession } from '@/types';
import { IUserRepository, userRepository as defaultUserRepository } from '@/lib/db/repositories';
import { generateId, getDatabase } from '@/lib/db/connection';
import { supabase } from '@/lib/db/supabase';

export interface IAuthService {
  register(email: string, password: string): Promise<User>;
  login(email: string, password: string): Promise<AuthSession>;
  logout(sessionId: string): Promise<void>;
  verifySession(sessionId: string): Promise<User | null>;
}

export class AuthService implements IAuthService {
  private userRepository: IUserRepository;
  private readonly SALT_ROUNDS = 10;
  private readonly SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

  constructor(userRepository?: IUserRepository) {
    this.userRepository = userRepository || defaultUserRepository;
  }

  /**
   * Register a new user with email and password
   * Requirements: 7.2
   */
  async register(email: string, password: string): Promise<User> {
    // Validate email format
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (!this.isValidPassword(password)) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

    // Create user in database
    try {
      const user = await this.userRepository.create(email, passwordHash);
      return user;
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already exists') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  /**
   * Login with email and password credentials
   * Requirements: 7.3
   */
  async login(email: string, password: string): Promise<AuthSession> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Create session
    const session = this.createSession(user);
    
    // Store session in Supabase
    try {
      await supabase.from('sessions').insert({
        session_id: session.sessionId,
        user_id: user.id,
        expires_at: session.expiresAt.toISOString(),
      });
    } catch (error) {
      // Fallback to in-memory if Supabase fails
      console.error('Failed to store session in Supabase, using in-memory:', error);
      const db = getDatabase();
      db.sessions.set(session.sessionId, session);
    }

    return session;
  }

  /**
   * Logout and invalidate session
   */
  async logout(sessionId: string): Promise<void> {
    // Delete from Supabase
    try {
      await supabase.from('sessions').delete().eq('session_id', sessionId);
    } catch (error) {
      console.error('Failed to delete session from Supabase:', error);
    }
    
    // Also delete from in-memory (for backward compatibility)
    const db = getDatabase();
    db.sessions.delete(sessionId);
  }

  /**
   * Verify if a session is valid and return the associated user
   * Requirements: 7.4
   */
  async verifySession(sessionId: string): Promise<User | null> {
    // Try to get session from Supabase first
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('user_id, expires_at')
        .eq('session_id', sessionId)
        .single();

      if (error || !data) {
        // Fallback to in-memory
        return this.verifySessionInMemory(sessionId);
      }

      // Check if session has expired
      const expiresAt = new Date(data.expires_at);
      if (new Date() > expiresAt) {
        // Delete expired session
        await supabase.from('sessions').delete().eq('session_id', sessionId);
        return null;
      }

      // Get user data
      const user = await this.userRepository.findById(data.user_id);
      return user;
    } catch (error) {
      console.error('Failed to verify session from Supabase:', error);
      // Fallback to in-memory
      return this.verifySessionInMemory(sessionId);
    }
  }

  /**
   * Verify session from in-memory storage (fallback)
   */
  private verifySessionInMemory(sessionId: string): User | null {
    const db = getDatabase();
    const session = db.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      db.sessions.delete(sessionId);
      return null;
    }

    return session.user;
  }

  /**
   * Create a new session for a user
   * Requirements: 7.4
   */
  private createSession(user: User): AuthSession {
    const sessionId = generateId();
    const expiresAt = new Date(Date.now() + this.SESSION_DURATION_MS);

    return {
      sessionId,
      user,
      expiresAt,
    };
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  private isValidPassword(password: string): boolean {
    return password.length >= 8;
  }

  /**
   * Clear all sessions (useful for testing)
   */
  static clearSessions(): void {
    const db = getDatabase();
    db.sessions.clear();
  }

  /**
   * Get session count (useful for testing)
   */
  static getSessionCount(): number {
    const db = getDatabase();
    return db.sessions.size;
  }
}
