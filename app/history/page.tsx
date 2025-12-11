'use client';

/**
 * Itinerary History Page
 * Displays list of user's previously generated itineraries
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { th } from '@/lib/localization/th';
import { Itinerary } from '@/types';
import { Loader2, MapPin, Calendar, Clock, ChevronRight } from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load itinerary history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/history');
      
      if (!response.ok) {
        throw new Error(th.history.loadingFailed);
      }

      const data = await response.json();
      setItineraries(data);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : th.history.loadingFailed;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date in en-GB
const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};


  // Handle click to view full itinerary details
  const handleViewDetails = (itineraryId: string) => {
    router.push(`/history/${itineraryId}`);
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            {th.history.title}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 px-4">
            {th.history.subtitle}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 space-y-4">
            <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 animate-spin" />
            <p className="text-lg sm:text-xl text-gray-700 font-medium">
              {th.history.loadingHistory}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-5 sm:p-6 mb-8">
            <p className="text-sm sm:text-base text-red-700">{error}</p>
            <button
              onClick={loadHistory}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 active:scale-95 text-sm sm:text-base"
            >
              {th.errors.tryAgain}
            </button>
          </div>
        )}

        {/* Empty State (Requirement 9.4) */}
        {!isLoading && !error && itineraries.length === 0 && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
              <MapPin className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-6" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                {th.history.empty}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-8">
                {th.history.emptySubtitle}
              </p>
              <button
                onClick={() => router.push('/generate')}
                className="bg-blue-600 text-white px-6 sm:px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-300 active:scale-95 shadow-md hover:shadow-lg text-sm sm:text-base"
              >
                {th.navigation.generateItinerary}
              </button>
            </div>
          </div>
        )}

        {/* Itinerary List (Requirements: 9.1, 9.2, 9.3) */}
        {!isLoading && !error && itineraries.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            {itineraries.map((itinerary) => (
              <div
                key={itinerary.id}
                onClick={() => handleViewDetails(itinerary.id)}
                className="bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Destination (Requirement 9.3) */}
                      <div className="flex items-center mb-3">
                        <MapPin className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" />
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                          {itinerary.destination}
                        </h3>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        {/* Duration (Requirement 9.3) */}
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1.5 flex-shrink-0" />
                          <span>
                            {itinerary.duration} {th.itinerary.days}
                          </span>
                        </div>

                        {/* Generation Date (Requirement 9.3) */}
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1.5 flex-shrink-0" />
                          <span className="truncate">{formatDate(itinerary.generatedAt)}</span>
                        </div>
                      </div>

                      {/* Activity Count */}
                      <div className="mt-3 text-xs sm:text-sm text-gray-500">
                        {itinerary.dailySchedules.reduce(
                          (total, schedule) => total + schedule.activities.length,
                          0
                        )}{' '}
                        {th.itinerary.activities}
                      </div>
                    </div>

                    {/* View Details Arrow */}
                    <div className="ml-2 sm:ml-4 flex-shrink-0">
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
