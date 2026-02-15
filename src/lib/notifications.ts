import { supabase } from "./supabase" // Client for client-side/public inserts
import { Database } from "@/types/database.types"
import { sendEmail } from "./email" // Server-only
import { NotificationEmail } from "@/emails/notification-email" // Server-only
import { createClient } from "@supabase/supabase-js"

type NotificationType = Database['public']['Tables']['notifications']['Row']['type']

interface NotificationPayload {
    userId: string
    title: string
    message: string
    type?: NotificationType
    email?: string // Optional: if caller already knows it
}

// Helper to get admin client for fetching user emails on server
function getAdminClient() {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null
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

/**
 * Sends a real-time notification to a specific user by inserting a record into the notifications table.
 * ALSO sends an email if running on the server.
 */
export async function sendNotification({
    userId,
    title,
    message,
    type = 'system',
    email
}: NotificationPayload) {
    try {
        // 1. In-App Notification (Database)
        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                title,
                message,
                type,
                read: false
            })

        if (error) {
            console.error('Error sending in-app notification:', error)
            // We continue to try sending email even if DB insert fails? Maybe better to log and continue.
        }

        // 2. Email Notification (Server-Side Only)
        // Check if we are on the server and have an API key
        if (typeof window === 'undefined' && process.env.RESEND_API_KEY) {
            let targetEmail = email

            // If email not provided, try to fetch it
            if (!targetEmail) {
                const adminClient = getAdminClient()
                if (adminClient) {
                    const { data: user, error: userError } = await adminClient.auth.admin.getUserById(userId)
                    if (!userError && user?.user?.email) {
                        targetEmail = user.user.email
                    }
                }
            }

            if (targetEmail) {
                await sendEmail({
                    to: targetEmail,
                    subject: title, // Use notification title as subject
                    react: NotificationEmail({
                        title,
                        message,
                        actionUrl: `https://hobortautopartsexpress.com/portal`, // Specific links could be passed in future
                        actionLabel: "View in Portal"
                    })
                })
            } else {
                console.warn("Skipping email notification: No email found for user", userId)
            }
        }

        return { success: true }
    } catch (error) {
        console.error('Unexpected error sending notification:', error)
        return { success: false, error }
    }
}
/**
 * Sends a real-time notification to all users with the 'admin' role.
 */
export async function notifyAdmins({
    title,
    message,
    type = 'system'
}: Omit<NotificationPayload, 'userId'>) {
    try {
        // 1. Fetch all admin IDs
        const { data: admins, error: fetchError } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'admin')

        if (fetchError) throw fetchError
        if (!admins || admins.length === 0) return { success: true, message: 'No admins found' }

        // 2. Insert notifications for all admins
        const notifications = admins.map(admin => ({
            user_id: admin.id,
            title,
            message,
            type,
            read: false
        }))

        const { error: insertError } = await supabase
            .from('notifications')
            .insert(notifications)

        if (insertError) throw insertError

        return { success: true }
    } catch (error) {
        console.error('Error in notifyAdmins:', error)
        return { success: false, error }
    }
}
