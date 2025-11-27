import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl: string | undefined = process.env.SUPABASE_URL;
const supabaseKey: string | undefined = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Warning: Supabase URL or Key not found in environment variables');
}

// Create Supabase client
// Use service role key for admin operations, or anon key for client-like operations
const supabase: SupabaseClient = createClient(supabaseUrl || '', supabaseKey || '');

export default supabase;

