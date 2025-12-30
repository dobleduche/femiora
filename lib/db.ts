
import { drizzle } from 'drizzle-orm/supabase-js';
import { createClient } from '@supabase/supabase-js';
import * as schema from '../db/schema';

// Ensure environment variables are loaded. In a real project, you'd use a .env file.
// For this environment, we assume they are globally available.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be provided.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const db = drizzle(supabase, { schema });

// Helper to get current authenticated user's ID
export const getUserId = async (): Promise<string> => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        throw new Error(`Authentication error: ${error.message}`);
    }
    if (!session) {
        // In a real app, you might redirect to a login page.
        // For now, we'll throw an error as the app assumes an authenticated user.
        throw new Error("User not authenticated. Please log in.");
    }
    return session.user.id;
};