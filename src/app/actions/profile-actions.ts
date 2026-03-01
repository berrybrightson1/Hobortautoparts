'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { logAction } from '@/lib/audit'

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

        await logAction('delete_account', { userId: user.id })

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

export async function upgradeToAgent(questionnaireData: any) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            throw new Error("Authentication required")
        }

        // Use Admin Client to bypass RLS for updating Auth Metadata securely
        const supabaseAdmin = getAdminClient()

        // 1. Update Auth Metadata with the questionnaire answers
        const { error: metaError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { user_metadata: { questionnaire: { ...questionnaireData, is_upgrade: true } } }
        )
        if (metaError) throw metaError

        // 2. Update Public Profile Role to lock them into the pending state
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ role: 'pending_agent' })
            .eq('id', user.id)

        if (profileError) throw profileError

        await logAction('upgrade_agent_request', { userId: user.id })

        revalidatePath('/portal')
        return { success: true }
    } catch (error: any) {
        console.error("Upgrade to Agent Error:", error)
        return { success: false, error: error.message || "Failed to submit agent application" }
    }
}
