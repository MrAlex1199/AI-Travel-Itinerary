'use client';

/**
 * Register Page
 * User registration page for creating new accounts
 * Requirements: 7.1, 10.1
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '@/components/AuthForm';
import { t } from '@/lib/localization';
import { AuthCredentials } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');

  const handleRegister = async (credentials: AuthCredentials) => {
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('auth.registrationFailed'));
        return;
      }

      // After successful registration, redirect to login page
      router.push('/login');
    } catch (err) {
      setError(t('errors.networkError'));
    }
  };

  return (
    <div className="min-h-screen bg-hero-pattern flex items-center justify-center px-4 py-8 sm:py-12 transition-colors duration-300">
      <div className="max-w-md w-full">
        {/* Card container */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 animate-fadeIn border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <svg className="w-16 h-16" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="registerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#3B82F6' }} />
                    <stop offset="100%" style={{ stopColor: '#8B5CF6' }} />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="48" fill="url(#registerGrad)"/>
                <path d="M30 55 L45 35 L55 45 L70 30 L75 55 Z" fill="white" opacity="0.9"/>
                <circle cx="35" cy="40" r="6" fill="white" opacity="0.9"/>
                <path d="M25 60 Q50 75 75 60 L75 70 Q50 85 25 70 Z" fill="white" opacity="0.7"/>
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gradient">
              {t('auth.registerTitle')}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('auth.registerSubtitle')}</p>
          </div>

          {/* Auth form */}
          <AuthForm mode="register" onSubmit={handleRegister} error={error} />

          {/* Login link */}
          <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {t('auth.haveAccount')}{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300"
              >
                {t('auth.loginButton')}
              </Link>
            </p>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-6">
          AI Travel Itinerary
        </p>
      </div>
    </div>
  );
}
