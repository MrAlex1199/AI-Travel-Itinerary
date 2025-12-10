/**
 * Next.js Middleware
 * 
 * Protects routes that require authentication.
 * Runs before route handlers to check authentication status.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AuthService } from '@/services/AuthService';

// Routes that require authentication
const protectedRoutes = ['/generate', '/history'];

// Routes that should redirect to home if already authenticated
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionId = request.cookies.get('sessionId')?.value;

  // Check if user is authenticated
  let isAuthenticated = false;
  if (sessionId) {
    const authService = new AuthService();
    const user = await authService.verifySession(sessionId);
    isAuthenticated = user !== null;
  }

  // Protect routes that require authentication
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // Redirect to login page
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
