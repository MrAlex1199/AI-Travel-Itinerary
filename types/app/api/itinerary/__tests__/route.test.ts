/**
 * Itinerary API Route Tests
 * 
 * Tests for the POST /api/itinerary endpoint.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from '../route';
import { NextRequest } from 'next/server';
import { clearDatabase } from '@/lib/db/connection';
import { AuthService } from '@/services/AuthService';
import { th } from '@/lib/localization/th';

describe('POST /api/itinerary', () => {
  let authService: AuthService;
  let sessionId: string;
  let userId: string;

  beforeEach(async () => {
    clearDatabase();
    AuthService.clearSessions();
    authService = new AuthService();

    // Create a test user and session
    const user = await authService.register('test@example.com', 'password123');
    userId = user.id;
    const session = await authService.login('test@example.com', 'password123');
    sessionId = session.sessionId;
  });

  afterEach(() => {
    clearDatabase();
    AuthService.clearSessions();
    vi.restoreAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    const request = new NextRequest('http://localhost:3000/api/itinerary', {
      method: 'POST',
      body: JSON.stringify({
        destination: 'Bangkok',
        duration: 3,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('กรุณาเข้าสู่ระบบ');
  });

  it('should return 400 if destination is missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/itinerary', {
      method: 'POST',
      headers: {
        Cookie: `sessionId=${sessionId}`,
      },
      body: JSON.stringify({
        duration: 3,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 400 if duration is less than 1', async () => {
    const request = new NextRequest('http://localhost:3000/api/itinerary', {
      method: 'POST',
      headers: {
        Cookie: `sessionId=${sessionId}`,
      },
      body: JSON.stringify({
        destination: 'Bangkok',
        duration: 0,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe(th.validation.durationMinimum);
  });

  it('should return 400 if request body is invalid JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/itinerary', {
      method: 'POST',
      headers: {
        Cookie: `sessionId=${sessionId}`,
        'Content-Type': 'application/json',
      },
      body: 'invalid json',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe(th.validation.required);
  });

  it.skip('should generate and save itinerary with valid input (requires API key)', async () => {
    // This test requires a valid GOOGLE_GENAI_API_KEY environment variable
    // Skip in CI/CD or when API key is not available
    const request = new NextRequest('http://localhost:3000/api/itinerary', {
      method: 'POST',
      headers: {
        Cookie: `sessionId=${sessionId}`,
      },
      body: JSON.stringify({
        destination: 'Bangkok',
        duration: 3,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toBe(th.success.itineraryGenerated);
    expect(data.itinerary).toBeDefined();
    expect(data.itinerary.destination).toBe('Bangkok');
    expect(data.itinerary.duration).toBe(3);
    expect(data.itinerary.id).toBeDefined();
    expect(data.itinerary.generatedAt).toBeDefined();
    expect(data.itinerary.dailySchedules).toBeDefined();
    expect(data.itinerary.recommendations).toBeDefined();
  }, 60000); // 60 second timeout for AI generation

  it('should handle AI generation errors gracefully', async () => {
    // Mock the ItineraryGenerator to throw an error
    const { ItineraryGenerator } = await import('@/services/ItineraryGenerator');
    vi.spyOn(ItineraryGenerator.prototype, 'generateItinerary').mockRejectedValue(
      new Error('AI service unavailable')
    );

    const request = new NextRequest('http://localhost:3000/api/itinerary', {
      method: 'POST',
      headers: {
        Cookie: `sessionId=${sessionId}`,
      },
      body: JSON.stringify({
        destination: 'Bangkok',
        duration: 3,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });
});
