/**
 * Session Verification API Route
 * GET /api/auth/session
 * 
 * Verifies the current session and returns user information.
 * Requirements: 7.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/AuthService';

// Use Node.js runtime for database compatibility
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Get session ID from cookie
    const sessionId = request.cookies.get('sessionId')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'ไม่พบเซสชัน' }, // Session not found
        { status: 401 }
      );
    }

    // Verify session
    const authService = new AuthService();
    const user = await authService.verifySession(sessionId);

    if (!user) {
      return NextResponse.json(
        { error: 'เซสชันหมดอายุหรือไม่ถูกต้อง' }, // Session expired or invalid
        { status: 401 }
      );
    }

    // Return user data
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการตรวจสอบเซสชัน' }, // Session verification error
      { status: 500 }
    );
  }
}
