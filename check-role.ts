
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUserRole() {
    const email = 'berrybrightson@gmail.com'
    console.log(`Checking role for: ${email}`)

    // 1. Get User ID from Auth (if possible via admin api, or just search profiles if we sync email)
    // Profiles table might not have email column depending on schema, usually it does or we join.
    // Let's check auth.users via admin API to be sure.

    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
        console.error("Auth List Error:", authError)
        return
    }

    const user = users.find(u => u.email === email)

    if (!user) {
        console.error("User not found in Auth system.")
        return
    }

    console.log(`User ID: ${user.id}`)
    console.log(`Auth Metadata Role: ${user.user_metadata?.role}`)

    // 2. Check Profiles Table
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profileError) {
        console.error("Profile Fetch Error:", profileError)
    } else {
        console.log("Profile Table Data:", profile)
    }
}

checkUserRole()
