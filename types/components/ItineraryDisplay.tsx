'use client';

import { Itinerary } from '@/types';
import { ActivitySchedule } from './ActivitySchedule';
import { RecommendationList } from './RecommendationList';
import { th } from '@/lib/localization/th';
import { Calendar, MapPin, Clock } from 'lucide-react';

interface ItineraryDisplayProps {
  itinerary: Itinerary;
  onSave?: () => void;
}

export function ItineraryDisplay({ itinerary, onSave }: ItineraryDisplayProps) {
  // Defensive: ensure dailySchedules is an array (handle JSON serialization edge cases)
  const dailySchedulesArray = Array.isArray(itinerary.dailySchedules)
    ? itinerary.dailySchedules
    : typeof itinerary.dailySchedules === 'string'
    ? JSON.parse(itinerary.dailySchedules)
    : [];
  
  // Sort daily schedules chronologically by day number
  const sortedSchedules = [...dailySchedulesArray].sort((a, b) => a.day - b.day);

  // Format date for display
  const formatDate = (date: Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
              {itinerary.destination}
            </h2>
            
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 text-blue-50">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">
                  {itinerary.duration} {th.itinerary.days}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base">{th.itinerary.generatedAt}: {formatDate(itinerary.generatedAt)}</span>
              </div>
            </div>
          </div>
          
          {onSave && (
            <button
              onClick={onSave}
              className="w-full sm:w-auto bg-white text-blue-600 px-6 py-2.5 rounded-lg font-medium hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
            >
              {th.common.save}
            </button>
          )}
        </div>
      </div>

      {/* Daily Schedules */}
      <div className="mb-12">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 px-1">
          {th.itinerary.activities}
        </h3>
        
        <div className="space-y-8">
          {sortedSchedules.map((schedule) => (
            <ActivitySchedule
              key={schedule.day}
              schedule={schedule}
              dayNumber={schedule.day}
            />
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {(() => {
        const recsArray = Array.isArray(itinerary.recommendations)
          ? itinerary.recommendations
          : typeof itinerary.recommendations === 'string'
          ? JSON.parse(itinerary.recommendations)
          : [];
        
        return recsArray.length > 0 && (
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-md">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              {th.itinerary.recommendations}
            </h3>
            
            <RecommendationList recommendations={recsArray} />
          </div>
        );
      })()}
    </div>
  );
}
