import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Main client for current user session (uses cookies via SSR package)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Admin-only client for creating new users without losing current session
// This client does not persist the session to local storage
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
})
