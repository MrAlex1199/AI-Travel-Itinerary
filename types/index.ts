// Type definitions for the application

export interface TripInput {
  destination: string;
  duration: number; // days
}

export interface Activity {
  time: string; // HH:mm format
  name: string;
  location: string;
  description: string;
  icon?: string;
}

export interface DailySchedule {
  day: number;
  activities: Activity[];
}

export interface Recommendation {
  id: string;
  category: 'place' | 'restaurant' | 'experience';
  name: string;
  description: string;
  location?: string;
}

export interface Itinerary {
  id: string;
  destination: string;
  duration: number;
  dailySchedules: DailySchedule[];
  recommendations: Recommendation[];
  generatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  sessionId: string;
  user: User;
  expiresAt: Date;
}
