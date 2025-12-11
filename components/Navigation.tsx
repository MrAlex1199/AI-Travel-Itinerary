'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { th } from '@/lib/localization/th';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

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
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link
            href="/"
            className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            {th.navigation.home}
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-8">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-300 transform hover:scale-105 active:scale-95"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
            {user && (
              <>
                <Link
                  href="/generate"
                  className={`text-xs sm:text-sm font-medium transition-all duration-300 relative px-2 sm:px-3 py-2 rounded-md ${
                    isActive('/generate')
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50'
                  }`}
                >
                  <span className="hidden sm:inline">{th.navigation.generateItinerary}</span>
                  <span className="sm:hidden">สร้าง</span>
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transition-all duration-300 ${
                      isActive('/generate') ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </Link>

                <Link
                  href="/history"
                  className={`text-xs sm:text-sm font-medium transition-all duration-300 relative px-2 sm:px-3 py-2 rounded-md ${
                    isActive('/history')
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50'
                  }`}
                >
                  <span className="hidden sm:inline">{th.navigation.history}</span>
                  <span className="sm:hidden">ประวัติ</span>
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transition-all duration-300 ${
                      isActive('/history') ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </Link>

                {/* User Info */}
                <div className="flex items-center space-x-2 sm:space-x-4 pl-2 sm:pl-6 ml-2 border-l border-gray-300 dark:border-slate-600">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium hidden md:inline truncate max-w-[150px]">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 px-2 sm:px-4 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transform hover:scale-105 active:scale-95"
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
                  className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 px-3 sm:px-4 py-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/50 transform hover:scale-105 active:scale-95"
                >
                  {th.navigation.login}
                </Link>
                <Link
                  href="/register"
                  className="text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-300 px-3 sm:px-4 py-2 rounded-md shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
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
