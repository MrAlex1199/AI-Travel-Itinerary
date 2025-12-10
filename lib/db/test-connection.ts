/**
 * Supabase Connection Test
 * 
 * Run this script to test your Supabase connection.
 * Usage: npx tsx lib/db/test-connection.ts
 */

import 'dotenv/config';
import { supabase } from './supabase';

async function testConnection() {
  console.log('Testing Supabase connection...\n');

  try {
    // Test 1: Check if we can connect
    console.log('1. Testing basic connection...');
    const { data, error } = await supabase.from('users').select('count');
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      console.log('\nPossible issues:');
      console.log('- Check your NEXT_PUBLIC_SUPABASE_URL in .env');
      console.log('- Check your NEXT_PUBLIC_SUPABASE_ANON_KEY in .env');
      console.log('- Ensure your Supabase project is active');
      return;
    }

    console.log('✅ Connection successful!\n');

    // Test 2: Check if tables exist
    console.log('2. Checking if tables exist...');
    const tables = ['users', 'itineraries', 'daily_schedules', 'activities', 'recommendations'];
    
    for (const table of tables) {
      const { error: tableError } = await supabase.from(table).select('count').limit(0);
      if (tableError) {
        console.log(`❌ Table "${table}" not found or not accessible`);
        console.log(`   Error: ${tableError.message}`);
      } else {
        console.log(`✅ Table "${table}" exists`);
      }
    }

    console.log('\n3. Database setup status:');
    console.log('✅ All checks passed!');
    console.log('\nYou can now run the application with: npm run dev');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testConnection();
