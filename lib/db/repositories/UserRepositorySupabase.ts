/**
 * User Repository (Supabase Implementation)
 * 
 * Handles all database operations related to users using Supabase.
 */

import { User } from '@/types';
import { supabase } from '../supabase';

export interface IUserRepository {
  create(email: string, passwordHash: string): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, updates: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}

export class UserRepositorySupabase implements IUserRepository {
  /**
   * Create a new user
   */
  async create(email: string, passwordHash: string): Promise<User> {
    // Check if email already exists
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new Error('Email already exists');
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return {
      id: data.id,
      email: data.email,
      passwordHash: data.password_hash,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      passwordHash: data.password_hash,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      passwordHash: data.password_hash,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Update user
   */
  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const updateData: any = {};
    
    if (updates.email) updateData.email = updates.email;
    if (updates.passwordHash) updateData.password_hash = updates.passwordHash;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      passwordHash: data.password_hash,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    return !error;
  }
}
