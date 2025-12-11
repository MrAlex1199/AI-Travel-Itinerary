/**
 * User Login API Route
 * POST /api/auth/login
 * 
 * Handles user login with email and password credentials.
 * Requirements: 7.3, 7.4, 7.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/AuthService';

// Use Node.js runtime for bcryptjs compatibility
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'กรุณากรอกอีเมลและรหัสผ่าน' }, // Please enter email and password
        { status: 400 }
      );
    }

    // Create auth service and attempt login
    const authService = new AuthService();
    const session = await authService.login(email, password);

    // Create response with session cookie
    const response = NextResponse.json(
      {
        user: {
          id: session.user.id,
          email: session.user.email,
        },
        message: 'เข้าสู่ระบบสำเร็จ', // Login successful
      },
      { status: 200 }
    );

    // Set session cookie (httpOnly for security)
    response.cookies.set('sessionId', session.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      // Handle authentication failure
      if (error.message === 'Invalid credentials') {
        return NextResponse.json(
          { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, // Invalid email or password
          { status: 401 }
        );
      }
    }

    // Generic error
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }, // Login error occurred
      { status: 500 }
    );
  }
}
