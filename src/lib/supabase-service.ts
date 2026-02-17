import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Server-only Supabase client using the Service Role Key.
 * This client bypasses RLS and should ONLY be used in server-side contexts 
 * (Server Actions, API Routes) for privileged operations.
 */
export const supabaseService = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
})
