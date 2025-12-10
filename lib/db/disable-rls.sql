-- Disable Row Level Security for Development
-- Run this in Supabase SQL Editor for easier development
-- WARNING: Only use this in development! Enable RLS with proper policies for production

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations DISABLE ROW LEVEL SECURITY;
