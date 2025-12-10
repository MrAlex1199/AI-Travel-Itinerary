# Database Module

This module provides database connection utilities and repository pattern implementations for data access with support for both in-memory (testing) and Supabase (production) databases.

## Overview

The database module automatically switches between:
- **In-Memory Database**: Used during tests for speed and isolation
- **Supabase (PostgreSQL)**: Used in development and production for persistent storage

## Structure

```
lib/db/
├── schema.sql                          # PostgreSQL schema definition
├── connection.ts                       # In-memory database utilities
├── supabase.ts                         # Supabase client configuration
├── disable-rls.sql                     # Disable RLS for development
├── test-connection.ts                  # Test Supabase connection
├── SUPABASE_SETUP.md                   # Detailed setup guide
├── repositories/                       # Repository implementations
│   ├── UserRepository.ts               # In-memory user repository
│   ├── UserRepositorySupabase.ts       # Supabase user repository
│   ├── ItineraryRepository.ts          # In-memory itinerary repository
│   ├── ItineraryRepositorySupabase.ts  # Supabase itinerary repository
│   └── index.ts                        # Auto-selects implementation
├── __tests__/                          # Tests
│   └── repositories.test.ts
└── index.ts                            # Main module exports
```

## Quick Start

### 1. Set Up Supabase

1. Create a `.env` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

2. Run the schema in Supabase SQL Editor:
   - Open your Supabase project
   - Go to SQL Editor
   - Copy and paste contents of `schema.sql`
   - Click Run

3. Disable RLS for development:
   - Copy and paste contents of `disable-rls.sql`
   - Click Run

4. Test the connection:
   ```bash
   npx tsx lib/db/test-connection.ts
   ```

See `SUPABASE_SETUP.md` for detailed instructions.

### 2. Start Development

```bash
npm run dev
```

The app will automatically use Supabase when the environment variables are set!

## Usage

### Importing Repositories

```typescript
import { userRepository, itineraryRepository } from '@/lib/db';
```

The repositories automatically use the correct implementation (in-memory for tests, Supabase for production).

### User Repository

```typescript
// Create a new user
const user = await userRepository.create('user@example.com', 'hashedPassword');

// Find user by ID
const user = await userRepository.findById(userId);

// Find user by email
const user = await userRepository.findByEmail('user@example.com');

// Update user
const updated = await userRepository.update(userId, { email: 'new@example.com' });

// Delete user
await userRepository.delete(userId);
```

### Itinerary Repository

```typescript
// Create a new itinerary
const itinerary = await itineraryRepository.create({
  userId: 'user-id',
  destination: 'Bangkok',
  duration: 3,
  dailySchedules: [...],
  recommendations: [...],
});

// Find itinerary by ID
const itinerary = await itineraryRepository.findById(itineraryId);

// Find all itineraries for a user (returns in reverse chronological order)
const itineraries = await itineraryRepository.findByUserId(userId);

// Delete itinerary
await itineraryRepository.delete(itineraryId);
```

## Database Schema

The schema includes the following tables:

- **users**: User accounts with authentication credentials
- **itineraries**: Travel itineraries associated with users
- **daily_schedules**: Daily schedules within itineraries
- **activities**: Individual activities within daily schedules
- **recommendations**: Recommendations associated with itineraries

All tables include proper foreign keys, indexes, and constraints for data integrity and performance.

## Implementation Selection

The application automatically selects the appropriate database implementation:

```typescript
const USE_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                     process.env.NODE_ENV !== 'test';

export const userRepository = USE_SUPABASE 
  ? new UserRepositorySupabase() 
  : new UserRepository();
```

This means:
- **Tests always use in-memory** (fast, isolated, no setup)
- **Development/Production use Supabase** (persistent, scalable)

## Testing

Tests automatically use the in-memory database:

```bash
npm test
```

Tests verify:
- User CRUD operations
- Itinerary CRUD operations
- Data integrity and relationships
- Reverse chronological ordering
- Error handling
- Property-based tests for correctness

## Troubleshooting

### Connection Issues

If you can't connect to Supabase:

1. Check `.env` file has correct credentials
2. Verify Supabase project is active
3. Run `npx tsx lib/db/test-connection.ts`
4. Check `SUPABASE_SETUP.md` for detailed troubleshooting

### RLS Issues

If you get permission errors:

1. Make sure you ran `disable-rls.sql` in Supabase
2. Or configure proper RLS policies (see `SUPABASE_SETUP.md`)

### Schema Issues

If tables don't exist:

1. Run `schema.sql` in Supabase SQL Editor
2. Verify all 5 tables were created in Table Editor

## Requirements Satisfied

This implementation satisfies:
- **Requirement 8.1**: Store complete itineraries associated with user accounts ✅
- **Requirement 8.2**: Persist destination, duration, activity schedules, and recommendations ✅
- **Requirement 8.3**: Record generation timestamps ✅
- **Requirement 8.4**: Retrieve itineraries by user with authorization ✅
- **Requirement 8.5**: Display itineraries in reverse chronological order ✅
