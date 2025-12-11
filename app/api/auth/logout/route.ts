/**
 * User Logout API Route
 * POST /api/auth/logout
 * 
 * Handles user logout and session invalidation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/AuthService';

// Use Node.js runtime for database compatibility
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get session ID from cookie
    const sessionId = request.cookies.get('sessionId')?.value;

    if (sessionId) {
      // Invalidate session
      const authService = new AuthService();
      await authService.logout(sessionId);
    }

    // Create response and clear session cookie
    const response = NextResponse.json(
      { message: 'ออกจากระบบสำเร็จ' }, // Logout successful
      { status: 200 }
    );

    response.cookies.delete('sessionId');

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการออกจากระบบ' }, // Logout error occurred
      { status: 500 }
    );
  }
}
