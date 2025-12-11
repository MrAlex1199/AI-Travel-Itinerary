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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="max-w-md w-full">
        {/* Card container */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {t('auth.registerTitle')}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">{t('auth.registerSubtitle')}</p>
          </div>

          {/* Auth form */}
          <AuthForm mode="register" onSubmit={handleRegister} error={error} />

          {/* Login link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600">
              {t('auth.haveAccount')}{' '}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-300"
              >
                {t('auth.loginButton')}
              </Link>
            </p>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-xs sm:text-sm text-gray-600 mt-6">
          AI Travel Itinerary
        </p>
      </div>
    </div>
  );
}
