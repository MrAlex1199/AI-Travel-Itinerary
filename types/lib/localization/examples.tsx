/**
 * Example usage of the localization system
 * This file demonstrates how to use the localization utilities in React components
 */

import { t, formatDate, formatDateTime, formatTime, formatDuration, getValidationError, getAuthError } from './index';

// Example 1: Basic translation in a component
export function LoginButton() {
  return <button>{t('auth.loginButton')}</button>;
}

// Example 2: Form with validation errors
export function DestinationFormExample() {
  const errors = {
    destination: getValidationError('destinationRequired'),
    duration: getValidationError('durationMinimum'),
  };

  return (
    <form>
      <div>
        <label>{t('destinationForm.destination')}</label>
        <input placeholder={t('destinationForm.destinationPlaceholder')} />
        {errors.destination && <span className="error">{errors.destination}</span>}
      </div>
      <div>
        <label>{t('destinationForm.duration')}</label>
        <input type="number" placeholder={t('destinationForm.durationPlaceholder')} />
        {errors.duration && <span className="error">{errors.duration}</span>}
      </div>
      <button type="submit">{t('destinationForm.generateButton')}</button>
    </form>
  );
}

// Example 3: Display itinerary with formatted dates
export function ItineraryCard({ itinerary }: { itinerary: any }) {
  return (
    <div>
      <h2>{itinerary.destination}</h2>
      <p>{formatDuration(itinerary.duration)}</p>
      <p>{t('itinerary.generatedAt')}: {formatDateTime(itinerary.generatedAt)}</p>
      
      {itinerary.dailySchedules.map((schedule: any, index: number) => (
        <div key={index}>
          <h3>{t('itinerary.day')} {schedule.day}</h3>
          {schedule.activities.map((activity: any, actIndex: number) => (
            <div key={actIndex}>
              <span>{formatTime(activity.time)}</span>
              <span>{activity.name}</span>
              <span>{activity.location}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Example 4: Authentication error handling
export function LoginForm() {
  const handleLogin = async (email: string, password: string) => {
    try {
      // Login logic here
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        // Display authentication error
        alert(getAuthError('invalidCredentials'));
      }
    } catch (error) {
      alert(getAuthError('loginFailed'));
    }
  };

  return (
    <form>
      <h1>{t('auth.loginTitle')}</h1>
      <p>{t('auth.loginSubtitle')}</p>
      {/* Form fields */}
    </form>
  );
}

// Example 5: Navigation menu
export function Navigation() {
  return (
    <nav>
      <a href="/">{t('navigation.home')}</a>
      <a href="/generate">{t('navigation.generateItinerary')}</a>
      <a href="/history">{t('navigation.history')}</a>
      <button>{t('navigation.logout')}</button>
    </nav>
  );
}

// Example 6: History list with relative time
export function HistoryList({ itineraries }: { itineraries: any[] }) {
  if (itineraries.length === 0) {
    return (
      <div>
        <p>{t('history.empty')}</p>
        <p>{t('history.emptySubtitle')}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>{t('history.title')}</h1>
      <p>{t('history.subtitle')}</p>
      {itineraries.map((itinerary) => (
        <div key={itinerary.id}>
          <h3>{itinerary.destination}</h3>
          <p>{formatDuration(itinerary.duration)}</p>
          <p>{formatDate(itinerary.generatedAt)}</p>
          <button>{t('history.viewDetails')}</button>
        </div>
      ))}
    </div>
  );
}
