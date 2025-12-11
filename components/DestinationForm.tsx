'use client';

/**
 * DestinationForm Component
 * Form for inputting destination and trip duration to generate itineraries
 * Requirements: 1.1, 1.2, 1.3, 1.5, 5.2, 5.5
 */

import { useState, FormEvent } from 'react';
import { t } from '@/lib/localization';
import { TripInput } from '@/types';
import { MapPin, Calendar, Plane } from 'lucide-react';

interface DestinationFormProps {
  onSubmit: (data: TripInput) => Promise<void>;
  isLoading: boolean;
}

export default function DestinationForm({ onSubmit, isLoading }: DestinationFormProps) {
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    destination?: string;
    duration?: string;
  }>({});

  const validateDestination = (destination: string): boolean => {
    return destination.trim().length >= 1;
  };

  const validateDuration = (duration: string): boolean => {
    const num = parseInt(duration, 10);
    return !isNaN(num) && num >= 1;
  };

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    if (!destination.trim()) {
      errors.destination = t('validation.destinationRequired');
    } else if (!validateDestination(destination)) {
      errors.destination = t('validation.destinationRequired');
    }

    if (!duration) {
      errors.duration = t('validation.durationRequired');
    } else if (!validateDuration(duration)) {
      errors.duration = t('validation.durationMinimum');
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        destination: destination.trim(),
        duration: parseInt(duration, 10),
      });
    } catch (err) {
      // Error is handled by parent component
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Destination field */}
      <div>
        <label
          htmlFor="destination"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {t('destinationForm.destination')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-teal-500 dark:text-teal-400" />
          </div>
          <input
            id="destination"
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder={t('destinationForm.destinationPlaceholder')}
            className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
              validationErrors.destination
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-slate-600 focus:ring-teal-500 focus:border-teal-500'
            }`}
            disabled={isLoading}
            autoComplete="off"
          />
        </div>
        {validationErrors.destination && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{validationErrors.destination}</p>
        )}
      </div>

      {/* Duration field */}
      <div>
        <label
          htmlFor="duration"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {t('destinationForm.duration')}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-teal-500 dark:text-teal-400" />
          </div>
          <input
            id="duration"
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder={t('destinationForm.durationPlaceholder')}
            className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 ${
              validationErrors.duration
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 dark:border-slate-600 focus:ring-teal-500 focus:border-teal-500'
            }`}
            disabled={isLoading}
            autoComplete="off"
          />
        </div>
        {validationErrors.duration && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{validationErrors.duration}</p>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-300 flex items-center justify-center gap-2 ${
          isLoading
            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 active:scale-95 shadow-lg hover:shadow-xl'
        }`}
      >
        <Plane className="w-5 h-5" />
        {isLoading
          ? t('destinationForm.generating')
          : t('destinationForm.generateButton')}
      </button>
    </form>
  );
}
