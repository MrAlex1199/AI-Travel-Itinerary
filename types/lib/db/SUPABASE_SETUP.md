# Supabase Database Setup

This guide will help you set up the database schema in your Supabase project.

## Prerequisites

- A Supabase account and project
- Your Supabase project URL and anon key (already configured in `.env`)

## Setup Steps

### 1. Access Supabase SQL Editor

1. Go to your Supabase project dashboard: https://idovvgwgzedfcqlcftmz.supabase.co
2. Navigate to the **SQL Editor** in the left sidebar
3. Click **New Query**

### 2. Run the Database Schema

Copy and paste the entire contents of `lib/db/schema.sql` into the SQL editor and click **Run**.

This will create:
- `users` table
- `itineraries` table
- `daily_schedules` table
- `activities` table
- `recommendations` table
- All necessary indexes for performance

### 3. Verify Tables

After running the schema:
1. Go to **Table Editor** in the left sidebar
2. You should see all 5 tables listed
3. Click on each table to verify the structure

## Database Structure

### Users Table
- Stores user authentication information
- Fields: id, email, password_hash, created_at, updated_at

### Itineraries Table
- Stores generated travel itineraries
- Fields: id, user_id (FK), destination, duration, generated_at
- Linked to users via foreign key

### Daily Schedules Table
- Stores daily schedules for each itinerary
- Fields: id, itinerary_id (FK), day
- Linked to itineraries via foreign key

### Activities Table
- Stores activities for each daily schedule
- Fields: id, daily_schedule_id (FK), time, name, location, description, icon, order_index
- Linked to daily_schedules via foreign key

### Recommendations Table
- Stores recommendations for each itinerary
- Fields: id, itinerary_id (FK), category, name, description, location
- Linked to itineraries via foreign key

## Testing the Connection

After setting up the schema, you can test the connection by:

1. Starting the development server:
   ```bash
   npm run dev
   ```

2. Try registering a new user at http://localhost:3000/register

3. Check your Supabase dashboard's Table Editor to see if the user was created

## Switching Between In-Memory and Supabase

The application automatically uses:
- **Supabase** when `NEXT_PUBLIC_SUPABASE_URL` is set and `NODE_ENV !== 'test'`
- **In-Memory** database for tests (to keep tests fast and isolated)

To force in-memory mode, simply remove or comment out the Supabase environment variables in `.env`.

## Troubleshooting

### Connection Issues
- Verify your Supabase URL and anon key in `.env`
- Check that your Supabase project is active
- Ensure you've run the schema SQL

### Permission Issues
- The anon key has limited permissions by default
- For development, you may need to adjust Row Level Security (RLS) policies
- See the RLS section below

## Row Level Security (RLS)

By default, Supabase enables RLS on all tables. For this application to work, you need to either:

### Option 1: Disable RLS (Development Only)
For each table, run:
```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations DISABLE ROW LEVEL SECURITY;
```

### Option 2: Configure RLS Policies (Recommended for Production)
Create policies that allow authenticated users to access their own data:

```sql
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id);

-- Users can insert their own data
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Users can read their own itineraries
CREATE POLICY "Users can read own itineraries" ON itineraries
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can insert their own itineraries
CREATE POLICY "Users can insert own itineraries" ON itineraries
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Similar policies for other tables...
```

**Note:** For development purposes, disabling RLS (Option 1) is simpler. For production, implement proper RLS policies (Option 2).

## Next Steps

Once the database is set up:
1. Test user registration and login
2. Generate a travel itinerary
3. View your itinerary history
4. Check the Supabase dashboard to see the data

All data will now persist in Supabase instead of being lost on server restart!
