/**
 * History API Route
 * GET /api/history - Get user's itinerary history
 * Requirements: 8.4, 8.5, 9.1, 9.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { HistoryService } from '@/services/HistoryService';
import { AuthService } from '@/services/AuthService';
import { th } from '@/lib/localization/th';

const historyService = new HistoryService();
const authService = new AuthService();

export async function GET(request: NextRequest) {
  try {
    // Get session from cookie
    const sessionId = request.cookies.get('sessionId')?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: th.auth.authenticationRequired },
        { status: 401 }
      );
    }

    // Verify session and get user
    const user = await authService.verifySession(sessionId);

    if (!user) {
      return NextResponse.json(
        { error: th.auth.sessionExpired },
        { status: 401 }
      );
    }

    // Get user's itinerary history (Requirements: 8.4, 8.5, 9.5)
    const itineraries = await historyService.getItineraryHistory(user.id);

    return NextResponse.json(itineraries);
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: th.history.loadingFailed },
      { status: 500 }
    );
  }
}
