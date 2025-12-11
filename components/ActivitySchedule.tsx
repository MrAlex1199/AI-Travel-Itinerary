'use client';

import { DailySchedule } from '@/types';
import { ActivityCard } from './ActivityCard';
import { th } from '@/lib/localization/th';
import { Calendar } from 'lucide-react';

interface ActivityScheduleProps {
  schedule: DailySchedule;
  dayNumber: number;
}

export function ActivitySchedule({ schedule, dayNumber }: ActivityScheduleProps) {
  return (
    <div className="mb-8 animate-fadeIn">
      <div className="mb-5 pb-3 border-b-2 border-blue-100 dark:border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg flex items-center justify-center shadow-md animate-bounce-gentle">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {th.itinerary.day} {dayNumber}
          </h3>
        </div>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {schedule.activities.length > 0 ? (
          schedule.activities.map((activity, index) => (
            <div key={index} className="animate-slideIn" style={{ animationDelay: `${index * 100}ms` }}>
              <ActivityCard activity={activity} />
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm sm:text-base animate-pulse-slow">
            {th.itinerary.noActivities}
          </p>
        )}
      </div>
    </div>
  );
}
