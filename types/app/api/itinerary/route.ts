/**
 * Itinerary Generation API Route
 * 
 * POST /api/itinerary
 * Generates a new travel itinerary using AI and saves it to the database.
 * 
 * Requirements: 1.4, 2.3, 8.1, 8.3
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { ItineraryGenerator } from '@/services/ItineraryGenerator';
import { itineraryRepository } from '@/lib/db/repositories';
import { th } from '@/lib/localization/th';
import { z } from 'zod';

// Request body validation schema
const ItineraryRequestSchema = z.object({
  destination: z.string().min(1, th.validation.destinationRequired),
  duration: z.number().int().min(1, th.validation.durationMinimum),
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication (Requirement 7.4, 7.5)
    // TEMP: Allow bypass with ?dev=true for testing AI generation
    const url = new URL(request.url);
    const isDev = url.searchParams.get('dev') === 'true' && process.env.NODE_ENV === 'development';
    
    let user: any = null;
    if (!isDev) {
      const authResult = await requireAuth(request);
      
      // If not authenticated, requireAuth returns a NextResponse with error
      if (authResult instanceof NextResponse) {
        return authResult;
      }
      
      user = authResult.user;
    } else {
      // Dev mode: use fake user
      user = { id: 'dev-test-user', email: 'dev@test.com' };
      console.log('⚠️  Dev mode: using fake user for testing');
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: th.validation.required },
        { status: 400 }
      );
    }

    // Validate request data (Requirement 1.4)
    const validationResult = ItineraryRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => err.message);
      return NextResponse.json(
        { error: errors[0] || th.validation.required },
        { status: 400 }
      );
    }

    const { destination, duration } = validationResult.data;

    // Generate itinerary using AI (Requirement 2.3)
    const itineraryGenerator = new ItineraryGenerator();
    let itinerary;
    
    try {
      console.log('🚀 Starting AI generation for:', { destination, duration });
      itinerary = await itineraryGenerator.generateItinerary(
        { destination, duration },
        'th' // Thai language
      );
      console.log('✅ AI generation successful');
    } catch (error: any) {
      // Handle AI generation errors with Thai messages
      console.error('❌ AI generation failed:', error);
      const errorMessage = error?.message || th.errors.aiGenerationFailed;
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    // Save itinerary to database (Requirements 8.1, 8.3)
    try {
      console.log('💾 Saving itinerary to database...');
      const savedItinerary = await itineraryRepository.create({
        userId: user.id,
        destination: itinerary.destination,
        duration: itinerary.duration,
        dailySchedules: itinerary.dailySchedules,
        recommendations: itinerary.recommendations,
      });
      console.log('✅ Itinerary saved successfully:', savedItinerary.id);

      // Return the complete itinerary with success message
      return NextResponse.json(
        {
          success: true,
          message: th.success.itineraryGenerated,
          itinerary: savedItinerary,
        },
        { status: 201 }
      );
    } catch (error: any) {
      // Handle database errors
      console.error('❌ Failed to save itinerary:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
      });
      
      return NextResponse.json(
        { error: th.errors.databaseError },
        { status: 500 }
      );
    }
  } catch (error: any) {
    // Handle unexpected errors
    console.error('Unexpected error in itinerary generation:', error);
    
    return NextResponse.json(
      { error: th.errors.generic },
      { status: 500 }
    );
  }
}
