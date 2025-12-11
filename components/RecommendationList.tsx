'use client';

import { Recommendation } from '@/types';
import { th } from '@/lib/localization/th';
import { MapPin, Utensils, Sparkles, Star } from 'lucide-react';

interface RecommendationListProps {
  recommendations: Recommendation[];
}

export function RecommendationList({ recommendations }: RecommendationListProps) {
  // Group recommendations by category
  const groupedRecommendations = recommendations.reduce((acc, rec) => {
    if (!acc[rec.category]) {
      acc[rec.category] = [];
    }
    acc[rec.category].push(rec);
    return acc;
  }, {} as Record<string, Recommendation[]>);

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'place':
        return th.itinerary.placesOfInterest;
      case 'restaurant':
        return th.itinerary.restaurants;
      case 'experience':
        return th.itinerary.experiences;
      default:
        return category;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'place':
        return <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'restaurant':
        return <Utensils className="w-5 h-5 sm:w-6 sm:h-6" />;
      case 'experience':
        return <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />;
      default:
        return <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'place':
        return 'from-blue-500 to-blue-600';
      case 'restaurant':
        return 'from-orange-500 to-orange-600';
      case 'experience':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">{th.itinerary.noRecommendations}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {Object.entries(groupedRecommendations).map(([category, recs]) => (
        <div key={category} className="animate-fadeIn">
          <div className="flex items-center gap-3 mb-4 sm:mb-5">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${getCategoryColor(category)} rounded-lg flex items-center justify-center shadow-md`}>
              <div className="text-white">
                {getCategoryIcon(category)}
              </div>
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {getCategoryTitle(category)}
            </h4>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {recs.map((rec) => (
              <div
                key={rec.id}
                className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-5 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-300 group hover-lift"
              >
                <div className="flex items-start gap-2 mb-2">
                  <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <h5 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {rec.name}
                  </h5>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  {rec.description}
                </p>
                {rec.location && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-slate-600">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <span className="line-clamp-1">{rec.location}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
