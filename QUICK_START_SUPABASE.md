# Quick Start: Supabase Setup

Follow these 3 simple steps to get your database running:

## Step 1: Run Schema (2 minutes)

1. Open https://idovvgwgzedfcqlcftmz.supabase.co
2. Go to **SQL Editor** → **New Query**
3. Copy ALL of `lib/db/schema.sql` and paste
4. Click **Run**

## Step 2: Disable RLS (30 seconds)

1. In the same SQL Editor
2. Copy ALL of `lib/db/disable-rls.sql` and paste
3. Click **Run**

## Step 3: Test & Run (1 minute)

```bash
# Test connection
npx tsx lib/db/test-connection.ts

# Start app
npm run dev
```

## Done! 🎉

Visit http://localhost:3000 and:
- Register a user
- Generate an itinerary
- Check Supabase Table Editor to see your data!

---

**Need help?** See `SUPABASE_INTEGRATION.md` for detailed instructions.
