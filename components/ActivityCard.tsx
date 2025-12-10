'use client';

import { Activity } from '@/types';
import { Clock, MapPin, Compass } from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-700">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0 mt-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 rounded-full flex items-center justify-center shadow-sm">
            <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
            <span className="text-sm sm:text-base font-semibold text-blue-600 dark:text-blue-400">{activity.time}</span>
          </div>
          
          <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 leading-snug">
            {activity.name}
          </h4>
          
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{activity.location}</span>
          </div>
          
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {activity.description}
          </p>
        </div>
      </div>
    </div>
  );
}
