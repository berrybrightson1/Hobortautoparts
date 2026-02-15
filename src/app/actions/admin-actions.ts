'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth-checks'
import { sendEmail } from '@/lib/email'
import { WelcomeEmail } from '@/emails/welcome-email'
import { sendNotification } from '@/lib/notifications'

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
        await requireAdmin()
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

        // Notify user of role change
        if (newRole === 'agent') {
            await sendNotification({
                userId,
                title: 'Agent Application Approved',
                message: 'Congratulations! Your application to become a Hobort Agent has been approved. You now have access to the Agent Portal.',
                type: 'system'
            })
        }

        revalidatePath('/portal/users')
        return { success: true }
    } catch (error: any) {
        console.error("Update Role Error:", error)
        return { success: false, error: error.message }
    }
}

export async function createUser(formData: any) {
    try {
        await requireAdmin()
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

            // Send Welcome Email
            try {
                await sendEmail({
                    to: email,
                    subject: "Welcome to Hobort Auto Parts Express",
                    react: WelcomeEmail({
                        name: full_name || "Partner",
                        role: role
                    })
                })
            } catch (emailError) {
                console.error("Failed to send welcome email:", emailError)
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
        await requireAdmin()
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

export async function getUsersWithEmails() {
    try {
        await requireAdmin()
        const supabaseAdmin = getAdminClient()

        // Fetch profiles
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (profilesError) throw profilesError

        // Fetch auth users to get emails
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers()

        if (authError) throw authError

        // Merge email data with profiles
        const usersWithEmails = (profiles || []).map(profile => {
            const authUser = authData.users.find(u => u.id === profile.id)
            return {
                ...profile,
                email: authUser?.email || 'N/A'
            }
        })

        return { success: true, data: usersWithEmails }
    } catch (error: any) {
        console.error("Fetch Users With Emails Error:", error)
        return { success: false, error: error.message, data: [] }
    }
}

