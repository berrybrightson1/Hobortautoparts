import { supabase } from "./supabase" // Client for client-side/public inserts
import { supabaseService } from "./supabase-service" // Server-side client for privileged ops
import { Database } from "@/types/database.types"

type NotificationType = Database['public']['Tables']['notifications']['Row']['type']

interface NotificationPayload {
    userId: string
    title: string
    message: string
    type?: NotificationType
    link?: string
}

/**
 * Sends a real-time notification to a specific user by inserting a record into the notifications table.
 */
export async function sendNotification({
    userId,
    title,
    message,
    type = 'system',
    link
}: NotificationPayload) {
    try {
        // 1. In-App Notification (Database)
        const { error } = await supabaseService
            .from('notifications')
            .insert({
                user_id: userId,
                title,
                message,
                type,
                link: link || null,
                read: false
            } as any)

        if (error) {
            console.error('Error sending in-app notification:', error)
            return { success: false, error }
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
export async function notifyAdmins(payload: Omit<NotificationPayload, 'userId'>) {
    const { title, message, type = 'system', link } = payload
    try {
        // 1. Fetch all admin IDs using Service Role (bypassing RLS)
        const { data: admins, error: fetchError } = await supabaseService
            .from('profiles')
            .select('id')
            .eq('role', 'admin')

        if (fetchError) throw fetchError
        if (!admins || (admins as any[]).length === 0) return { success: true, message: 'No admins found' }

        // 2. Insert notifications for all admins
        const notifications = (admins as any[]).map(admin => ({
            user_id: admin.id,
            title,
            message,
            type,
            link: link,
            read: false
        }))

        const { error: insertError } = await supabaseService
            .from('notifications')
            .insert(notifications as any)

        if (insertError) throw insertError

        return { success: true }
    } catch (error) {
        console.error('Error in notifyAdmins:', error)
        return { success: false, error }
    }
}
