'use client';

/**
 * Generate Itinerary Page
 * Main page for generating travel itineraries
 * Requirements: 1.4, 6.1, 6.4, 6.5
 */

import { useState } from 'react';
import DestinationForm from '@/components/DestinationForm';
import { ItineraryDisplay } from '@/components/ItineraryDisplay';
import { th } from '@/lib/localization/th';
import { TripInput, Itinerary } from '@/types';
import { Loader2, AlertCircle } from 'lucide-react';

export default function GeneratePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle form submission - call /api/itinerary (Requirement 1.4)
  const handleSubmit = async (data: TripInput) => {
    setIsLoading(true);
    setError(null);
    setItinerary(null);

    try {
      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || th.errors.aiGenerationFailed);
      }

      const generatedItinerary = await response.json();
      setItinerary(generatedItinerary);
    } catch (err) {
      // Handle and display errors with Thai messages (Requirement 6.5)
      const errorMessage = err instanceof Error 
        ? err.message 
        : th.errors.aiGenerationFailed;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-hero-pattern min-h-screen -mt-8 pt-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 leading-tight">
            <span className="text-gradient">{th.destinationForm.title}</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 px-4">
            {th.destinationForm.subtitle}
          </p>
        </div>

        {/* Form Section */}
        {!itinerary && (
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 mb-8 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            <DestinationForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        )}

        {/* Loading Indicator (Requirement 6.1) */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 space-y-4">
            <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 dark:text-blue-400 animate-spin" />
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 font-medium">
              {th.destinationForm.generating}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {th.common.loading}
            </p>
          </div>
        )}

        {/* Error Display with Thai messages and styling (Requirement 6.5) */}
        {error && !isLoading && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 rounded-lg p-5 sm:p-6 mb-8 animate-fadeIn">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                  {th.common.error}
                </h3>
                <p className="text-sm sm:text-base text-red-700 dark:text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 active:scale-95 text-sm sm:text-base"
                >
                  {th.errors.tryAgain}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Itinerary Display with smooth appearance animation (Requirement 6.4) */}
        {itinerary && !isLoading && (
          <div className="animate-fadeIn">
            <ItineraryDisplay itinerary={itinerary} />
            
            {/* Generate Another Button */}
            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  setItinerary(null);
                  setError(null);
                }}
                className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 active:scale-95 shadow-md hover:shadow-lg text-sm sm:text-base"
              >
                {th.destinationForm.title}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
