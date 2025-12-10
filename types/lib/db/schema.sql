-- Database Schema for AI Travel Itinerary Application
-- This schema is designed for PostgreSQL

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Itineraries table
CREATE TABLE IF NOT EXISTS itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    destination VARCHAR(255) NOT NULL,
    duration INTEGER NOT NULL CHECK (duration >= 1),
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Daily schedules table
CREATE TABLE IF NOT EXISTS daily_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    itinerary_id UUID NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
    day INTEGER NOT NULL CHECK (day >= 1)
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    daily_schedule_id UUID NOT NULL REFERENCES daily_schedules(id) ON DELETE CASCADE,
    time VARCHAR(10) NOT NULL,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50),
    order_index INTEGER NOT NULL
);

-- Recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    itinerary_id UUID NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('place', 'restaurant', 'experience')),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_generated_at ON itineraries(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_schedules_itinerary_id ON daily_schedules(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_activities_daily_schedule_id ON activities(daily_schedule_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_itinerary_id ON recommendations(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
