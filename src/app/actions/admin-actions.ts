'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth-checks'
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
        // Ensure error is serializable
        // Ensure error is serializable
        return { success: false, error: error?.message || "Unknown server error", data: [] }
    }
}

export async function deleteUser(userId: string) {
    try {
        await requireAdmin()
        const supabaseAdmin = getAdminClient()

        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

        if (error) throw error

        revalidatePath('/portal/users')
        return { success: true }
    } catch (error: any) {
        console.error("Delete User Error:", error)
        if (error.code === '23503' || (error.message && error.message.includes('foreign key'))) {
            return { success: false, error: "Cannot delete user: They have active orders associated with their account." }
        }
        return { success: false, error: error.message }
    }
}

export async function suspendUser(userId: string) {
    try {
        await requireAdmin()
        const supabaseAdmin = getAdminClient()
        const { error } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { user_metadata: { suspended: true } }
        )

        if (error) throw error

        revalidatePath('/portal/users')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function unsuspendUser(userId: string) {
    try {
        await requireAdmin()
        const supabaseAdmin = getAdminClient()
        const { error } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { user_metadata: { suspended: false } }
        )

        if (error) throw error

        revalidatePath('/portal/users')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function resetUserPassword(userId: string, newPassword: string) {
    try {
        await requireAdmin()
        const supabaseAdmin = getAdminClient()
        const { error } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { password: newPassword }
        )

        if (error) throw error

        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function createProxyOrder(requestId: string, quoteId: string, userId: string, agentId: string | null) {
    try {
        await requireAdmin()
        const supabaseAdmin = getAdminClient()

        // 1. Create the order
        const { error: orderError } = await supabaseAdmin
            .from('orders')
            .insert({
                user_id: userId,
                quote_id: quoteId,
                agent_id: agentId,
                status: 'paid', // Admin bypass/offline payment
                payment_method: 'Manual Payment (Verified by Admin)'
            })

        if (orderError) throw orderError

        // 2. Update the request status
        const { error: requestError } = await supabaseAdmin
            .from('sourcing_requests')
            .update({ status: 'processing' })
            .eq('id', requestId)

        if (requestError) throw requestError

        // Notify Customer that Admin accepted on their behalf
        try {
            await sendNotification({
                userId: userId,
                title: 'Order Confirmed',
                message: 'Your order has been verified and confirmed by an administrator.',
                type: 'order'
            })
        } catch (notifyErr) {
            console.warn('Non-blocking notification failure:', notifyErr)
        }

        revalidatePath('/portal/admin/requests')
        return { success: true }
    } catch (error: any) {
        console.error("Create Proxy Order Error:", error)
        if (error.code === '23505') {
            return { success: false, error: "Order already exists for this quote." }
        }
        return { success: false, error: error.message || "Failed to create proxy order" }
    }
}

export async function getAdminSourcingRequests() {
    try {
        await requireAdmin()
        const supabaseAdmin = getAdminClient()

        const { data, error } = await supabaseAdmin
            .from('sourcing_requests')
            .select(`
                *,
                profiles (
                    full_name
                ),
                quotes (
                    *,
                    orders (id, status)
                )
            `)
            .order('created_at', { ascending: false })

        if (error) throw error

        return { success: true, data }
    } catch (error: any) {
        console.error("Fetch Requests Error:", error)
        return { success: false, error: error.message }
    }
}

export async function broadcastAnnouncement(title: string, message: string) {
    try {
        await requireAdmin()
        const supabaseAdmin = getAdminClient()

        // 1. Fetch all user IDs from profiles
        const { data: profiles, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id')

        if (profileError) throw profileError
        if (!profiles || profiles.length === 0) return { success: true, count: 0 }

        // 2. Fetch an admin ID for logging
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
        const adminId = users.length > 0 ? users[0].id : null

        // 3. Log to broadcast_history
        if (adminId) {
            const { error: historyError } = await supabaseAdmin
                .from('broadcast_history')
                .insert({
                    title: title,
                    message: message,
                    admin_id: adminId,
                    recipient_count: profiles.length
                })

            if (historyError) {
                console.warn("[Admin Action] Failed to log broadcast history:", historyError)
            }
        }

        // 4. Prepare bulk insert array
        const notificationsToInsert = profiles.map(profile => ({
            user_id: profile.id,
            title: title,
            message: message,
            type: 'system',
            read: false,
        }))

        // 5. Bulk insert notifications
        const { error: insertError } = await supabaseAdmin
            .from('notifications')
            .insert(notificationsToInsert)

        if (insertError) throw insertError

        return { success: true, count: profiles.length }
    } catch (error: any) {
        console.error("Broadcast Error:", error)
        return { success: false, error: error.message || "Failed to broadcast announcement" }
    }
}

export async function getBroadcastHistory() {
    try {
        await requireAdmin()
        const supabaseAdmin = getAdminClient()

        const { data, error } = await supabaseAdmin
            .from('broadcast_history')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) throw error

        if (data && data.length > 0) {
            const adminIds = Array.from(new Set(data.filter(d => d.admin_id).map(d => d.admin_id)))
            if (adminIds.length > 0) {
                const { data: profilesData } = await supabaseAdmin
                    .from('profiles')
                    .select('id, full_name')
                    .in('id', adminIds)

                const profileMap = new Map((profilesData || []).map(p => [p.id, p.full_name]))

                const enrichedData = data.map(item => ({
                    ...item,
                    profiles: { full_name: profileMap.get(item.admin_id) || 'Unknown Admin' }
                }))

                return { success: true, data: enrichedData }
            }
        }

        return { success: true, data: data || [] }
    } catch (error: any) {
        console.error("Fetch Broadcast History Error:", error)
        return { success: false, error: error.message, data: [] }
    }
}
