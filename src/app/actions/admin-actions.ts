'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Initialize Admin Client (Service Role)
// ONLY for use in Server Actions. Never export this or use on client.
function getAdminClient() {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined. Check your .env.local file.")
    }

    return createClient(
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

export async function updateUserRole(userId: string, newRole: 'customer' | 'agent' | 'admin') {
    try {
        const supabaseAdmin = getAdminClient()
        const { error } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { user_metadata: { role: newRole } }
        )

        // Also update public profiles table if necessary
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId)

        if (error) throw error
        if (profileError) throw profileError

        revalidatePath('/portal/users')
        return { success: true }
    } catch (error: any) {
        console.error("Update Role Error:", error)
        return { success: false, error: error.message }
    }
}

export async function createUser(formData: any) {
    try {
        const { email, password, full_name, role, phone_number } = formData

        const supabaseAdmin = getAdminClient()
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm since admin created it
            phone: phone_number,
            phone_confirm: true,
            user_metadata: {
                full_name,
                role
            }
        })

        if (error) throw error

        if (data.user) {
            // Explicitly ensure profile is updated/created correctly
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: data.user.id,
                    email: email,
                    full_name: full_name,
                    role: role,
                    phone_number: phone_number
                })

            if (profileError) {
                console.error("Profile Upsert Error (Non-fatal):", profileError)
            }
        }

        revalidatePath('/portal/users')
        return { success: true, user: data.user }

    } catch (error: any) {
        console.error("Create User Error:", error)
        return { success: false, error: error.message }
    }
}

export async function getUserSourcingHistory(userId: string) {
    try {
        const supabaseAdmin = getAdminClient()
        const { data, error } = await supabaseAdmin
            .from('sourcing_requests')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5)

        if (error) throw error

        return { success: true, data }
    } catch (error: any) {
        console.error("Fetch History Error:", error)
        return { success: false, error: error.message }
    }
}
