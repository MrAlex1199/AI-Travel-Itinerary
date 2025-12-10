-- Add Sessions Table
-- Run this if you already created the database schema
-- This adds persistent session storage

CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Disable RLS for sessions table (development only)
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
