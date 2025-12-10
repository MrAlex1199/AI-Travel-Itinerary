/**
 * Authentication Middleware
 * 
 * Provides utilities for protecting routes and verifying authentication.
 * Requirements: 7.4, 7.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/AuthService';
import { User } from '@/types';

/**
 * Verify authentication from request
 * Returns user if authenticated, null otherwise
 */
export async function verifyAuth(request: NextRequest): Promise<User | null> {
  const sessionId = request.cookies.get('sessionId')?.value;

  if (!sessionId) {
    return null;
  }

  const authService = new AuthService();
  const user = await authService.verifySession(sessionId);

  return user;
}

/**
 * Middleware to protect API routes
 * Returns user if authenticated, or error response if not
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ user: User } | NextResponse> {
  const user = await verifyAuth(request);

  if (!user) {
    return NextResponse.json(
      { error: 'กรุณาเข้าสู่ระบบ' }, // Please login
      { status: 401 }
    );
  }

  return { user };
}

/**
 * Helper to check if request is authenticated
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const user = await verifyAuth(request);
  return user !== null;
}

/**
 * Get current user from request
 */
export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  return verifyAuth(request);
}
