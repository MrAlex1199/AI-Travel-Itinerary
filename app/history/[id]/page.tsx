'use client';

/**
 * Individual Itinerary Detail Page
 * Displays complete historical itinerary
 * Requirements: 9.1, 9.2
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { th } from '@/lib/localization/th';
import { Itinerary } from '@/types';
import { ItineraryDisplay } from '@/components/ItineraryDisplay';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';

export default function ItineraryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const itineraryId = params.id as string;

  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load itinerary on mount
  useEffect(() => {
    if (itineraryId) {
      loadItinerary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itineraryId]);

  const loadItinerary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/history/${itineraryId}`);
      
      if (response.status === 404) {
        setError(th.errors.notFound);
        return;
      }

      if (!response.ok) {
        throw new Error(th.errors.loadFailed);
      }

      const data = await response.json();
      setItinerary(data);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : th.errors.loadFailed;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/history')}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-6 sm:mb-8 transition-all duration-300 group active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium text-sm sm:text-base">{th.common.back}</span>
        </button>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 space-y-4">
            <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 dark:text-blue-400 animate-spin" />
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 font-medium">
              {th.common.loading}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 rounded-lg p-5 sm:p-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                  {th.common.error}
                </h3>
                <p className="text-sm sm:text-base text-red-700 dark:text-red-300 mb-4">{error}</p>
                <button
                  onClick={() => router.push('/history')}
                  className="bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-all duration-300 active:scale-95 text-sm sm:text-base"
                >
                  {th.common.back}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Itinerary Display (Requirement 9.2) */}
        {itinerary && !isLoading && !error && (
          <div className="animate-fadeIn">
            <ItineraryDisplay itinerary={itinerary} />
          </div>
        )}
      </div>
    </div>
  );
}
