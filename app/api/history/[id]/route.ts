/**
 * Individual Itinerary API Route
 * GET /api/history/[id] - Get specific itinerary by ID
 * Requirements: 8.4, 9.1, 9.2, 9.5
 */

import { NextRequest, NextResponse } from 'next/server';
import { HistoryService } from '@/services/HistoryService';
import { AuthService } from '@/services/AuthService';
import { th } from '@/lib/localization/th';

const historyService = new HistoryService();
const authService = new AuthService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get specific itinerary with authorization check (Requirements: 8.4, 9.5)
    const itinerary = await historyService.getItineraryById(user.id, params.id);

    if (!itinerary) {
      return NextResponse.json(
        { error: th.errors.notFound },
        { status: 404 }
      );
    }

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    return NextResponse.json(
      { error: th.errors.loadFailed },
      { status: 500 }
    );
  }
}
