// Supabase client configuration using environment variables
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { supabaseUrl, supabaseAnonKey } from '@/config/env';

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL environment variable is required');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY environment variable is required');
}

// Create Supabase client with environment variables
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Export for convenience
export default supabase;