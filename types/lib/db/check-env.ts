/**
 * Check Environment Variables
 * This helps debug which database implementation is being used
 */

export function checkDatabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const nodeEnv = process.env.NODE_ENV;

  console.log('=== Database Configuration ===');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Not set');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Not set');
  console.log('NODE_ENV:', nodeEnv);
  
  const useSupabase = supabaseUrl && nodeEnv !== 'test';
  console.log('Using Supabase:', useSupabase ? '✅ YES' : '❌ NO (using in-memory)');
  console.log('==============================\n');

  return {
    supabaseUrl,
    supabaseKey,
    nodeEnv,
    useSupabase
  };
}
