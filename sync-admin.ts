
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

async function syncAdminRole() {
    const email = 'berrybrightson@gmail.com'
    console.log(`Syncing admin role for: ${email}`)

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
        console.error("List users error:", listError)
        return
    }

    const user = users.find(u => u.email === email)

    if (!user) {
        console.error("User not found.")
        return
    }

    console.log(`Found User ID: ${user.id}`)
    console.log(`Current Metadata Role: ${user.user_metadata?.role}`)

    // Update Auth Metadata to match DB
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { user_metadata: { ...user.user_metadata, role: 'admin' } }
    )

    if (updateError) {
        console.error("Update Error:", updateError)
    } else {
        console.log("Successfully updated Auth Metadata to 'admin'.")
        console.log("New Metadata:", updatedUser.user.user_metadata)
    }
}

syncAdminRole()
