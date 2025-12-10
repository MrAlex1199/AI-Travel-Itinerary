'use client';

import { Activity } from '@/types';
import { Clock, MapPin, Compass } from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-blue-200">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0 mt-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center shadow-sm">
            <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="text-sm sm:text-base font-semibold text-blue-600">{activity.time}</span>
          </div>
          
          <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2 leading-snug">
            {activity.name}
          </h4>
          
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-600 leading-relaxed">{activity.location}</span>
          </div>
          
          <p className="text-sm text-gray-700 leading-relaxed">
            {activity.description}
          </p>
        </div>
      </div>
    </div>
  );
}
