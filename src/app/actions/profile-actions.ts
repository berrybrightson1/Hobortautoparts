'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Initialize Admin Client for "sudo" operations (like deleting auth users)
function getAdminClient() {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined")
    }
    return createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}

export async function deleteMyAccount() {
    try {
        // use the server client helper which handles cookies correctly
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            throw new Error("Authentication required")
        }

        // Use Admin Client to perform the deletion
        const supabaseAdmin = getAdminClient()

        // This will cascade to profiles, sourcing_requests, etc.
        // It will FAIL if there are orders (due to NO CAscade on orders.user_id)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

        if (deleteError) {
            throw deleteError
        }

        return { success: true }
    } catch (error: any) {
        console.error("Delete Account Error:", error)
        // Friendly error for FK violation
        if (error.code === '23503' || (error.message && error.message.includes('foreign key'))) {
            return {
                success: false,
                error: "Cannot delete account because you have active or past orders. Please contact support to archive your data."
            }
        }
        return { success: false, error: error.message || "Failed to delete account" }
    }
}
