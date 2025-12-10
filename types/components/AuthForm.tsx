'use client';

/**
 * AuthForm Component
 * Reusable authentication form for login and registration
 * Requirements: 7.1, 10.1
 */

import { useState, FormEvent } from 'react';
import { t } from '@/lib/localization';
import { AuthCredentials } from '@/types';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (credentials: AuthCredentials) => Promise<void>;
  error?: string;
}

export default function AuthForm({ mode, onSubmit, error }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const isRegisterMode = mode === 'register';

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const validatePassword = (password: string): boolean => {
    return password.length >= 8;
  };

  // Form validation
  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    if (!email) {
      errors.email = t('validation.required');
    } else if (!validateEmail(email)) {
      errors.email = t('validation.invalidEmail');
    }

    if (!password) {
      errors.password = t('validation.required');
    } else if (!validatePassword(password)) {
      errors.password = t('validation.passwordTooShort');
    }

    if (isRegisterMode) {
      if (!confirmPassword) {
        errors.confirmPassword = t('validation.required');
      } else if (password !== confirmPassword) {
        errors.confirmPassword = t('validation.passwordsDoNotMatch');
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Clear previous validation errors
    setValidationErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit({ email, password });
    } catch (err) {
      // Error is handled by parent component
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {t('auth.email')}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
            validationErrors.email
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          disabled={isLoading}
          autoComplete="email"
        />
        {validationErrors.email && (
          <p className="mt-2 text-sm text-red-600">{validationErrors.email}</p>
        )}
      </div>

      {/* Password field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {t('auth.password')}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
            validationErrors.password
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          disabled={isLoading}
          autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
        />
        {validationErrors.password && (
          <p className="mt-2 text-sm text-red-600">{validationErrors.password}</p>
        )}
      </div>

      {/* Confirm password field (register mode only) */}
      {isRegisterMode && (
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {t('auth.confirmPassword')}
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              validationErrors.confirmPassword
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            disabled={isLoading}
            autoComplete="new-password"
          />
          {validationErrors.confirmPassword && (
            <p className="mt-2 text-sm text-red-600">
              {validationErrors.confirmPassword}
            </p>
          )}
        </div>
      )}

      {/* Server error display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-300 ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
        }`}
      >
        {isLoading
          ? t('common.loading')
          : isRegisterMode
          ? t('auth.registerButton')
          : t('auth.loginButton')}
      </button>
    </form>
  );
}
