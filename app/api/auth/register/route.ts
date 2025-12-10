/**
 * User Registration API Route
 * POST /api/auth/register
 * 
 * Handles user registration with email and password.
 * Requirements: 7.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/AuthService';

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

    // Create auth service and register user
    const authService = new AuthService();
    const user = await authService.register(email, password);

    // Return user data (without password hash)
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
        message: 'ลงทะเบียนสำเร็จ', // Registration successful
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      // Handle specific errors
      if (error.message === 'Email already exists') {
        return NextResponse.json(
          { error: 'อีเมลนี้ถูกใช้งานแล้ว' }, // This email is already in use
          { status: 409 }
        );
      }
      
      if (error.message === 'Invalid email format') {
        return NextResponse.json(
          { error: 'รูปแบบอีเมลไม่ถูกต้อง' }, // Invalid email format
          { status: 400 }
        );
      }

      if (error.message === 'Password must be at least 8 characters long') {
        return NextResponse.json(
          { error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' }, // Password must be at least 8 characters
          { status: 400 }
        );
      }
    }

    // Generic error
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลงทะเบียน' }, // Registration error occurred
      { status: 500 }
    );
  }
}
