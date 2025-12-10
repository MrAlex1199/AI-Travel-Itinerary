'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { th } from '@/lib/localization/th';
import { useTheme } from './ThemeProvider';
import { Moon, Sun } from 'lucide-react';

interface User {
  id: string;
  email: string;
}

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Fetch current session
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        // User not logged in
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        setUser(null);
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Don't show navigation on auth pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gradient hover:opacity-80 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <svg className="w-8 h-8" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="navGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#3B82F6' }} />
                  <stop offset="100%" style={{ stopColor: '#8B5CF6' }} />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="48" fill="url(#navGrad)"/>
              <path d="M30 55 L45 35 L55 45 L70 30 L75 55 Z" fill="white" opacity="0.9"/>
              <circle cx="35" cy="40" r="6" fill="white" opacity="0.9"/>
              <path d="M25 60 Q50 75 75 60 L75 70 Q50 85 25 70 Z" fill="white" opacity="0.7"/>
            </svg>
            <span className="hidden sm:inline">{th.navigation.home}</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-8">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {user && (
              <>
                <Link
                  href="/generate"
                  className={`text-xs sm:text-sm font-medium transition-all duration-300 relative px-2 sm:px-3 py-2 rounded-md ${
                    isActive('/generate')
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                  }`}
                >
                  <span className="hidden sm:inline">{th.navigation.generateItinerary}</span>
                  <span className="sm:hidden">สร้าง</span>
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 ${
                      isActive('/generate') ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </Link>

                <Link
                  href="/history"
                  className={`text-xs sm:text-sm font-medium transition-all duration-300 relative px-2 sm:px-3 py-2 rounded-md ${
                    isActive('/history')
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                  }`}
                >
                  <span className="hidden sm:inline">{th.navigation.history}</span>
                  <span className="sm:hidden">ประวัติ</span>
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300 ${
                      isActive('/history') ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </Link>

                {/* User Info */}
                <div className="flex items-center space-x-2 sm:space-x-4 pl-2 sm:pl-6 ml-2 border-l border-gray-300 dark:border-gray-600">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium hidden md:inline truncate max-w-[150px]">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 px-2 sm:px-4 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transform hover:scale-105 active:scale-95"
                  >
                    {th.navigation.logout}
                  </button>
                </div>
              </>
            )}

            {!user && !isLoading && (
              <>
                <Link
                  href="/login"
                  className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 px-3 sm:px-4 py-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transform hover:scale-105 active:scale-95"
                >
                  {th.navigation.login}
                </Link>
                <Link
                  href="/register"
                  className="text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 px-3 sm:px-4 py-2 rounded-md shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                >
                  {th.navigation.register}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
